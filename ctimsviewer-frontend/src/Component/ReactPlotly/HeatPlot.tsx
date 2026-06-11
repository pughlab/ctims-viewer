import React, { useState, useMemo, useEffect } from "react";
import Plot from "react-plotly.js";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import "./PlotStyles.css";

interface DataItem {
  t: string;
  p: number;
  s: string;
}

interface HeatmapChartProps {
  data: DataItem[];
  study_id: string;
  onBarClick: (patient: string, study: string) => void;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, study_id, onBarClick }) => {
  const trialArmNames = Array.from(new Set(data.map((item) => item.t)));
  const patientIds = Array.from(new Set(data.map((item) => item.p)));
  const patientIdsAsStrings = patientIds.map(String);
  const [isSorted, setIsSorted] = useState(true);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedSortOption, setSelectedSortOption] = useState("trialId");
  const [sortedData, setSortedData] = useState({
    trialArms: trialArmNames,
    patients: patientIdsAsStrings,
  });



  const patientCountByArm = useMemo(() => {
    return trialArmNames.reduce((acc, trialArm) => {
      const patientsInArm = new Set(
        data.filter((item) => item.t === trialArm).map((item) => item.p)
      );
      acc[trialArm] = patientsInArm.size;
      return acc;
    }, {} as Record<string, number>);
  }, [data, trialArmNames]);

  const armCountByPatient = useMemo(() => {
    return patientIdsAsStrings.reduce((acc, patientId) => {
      const armsInPatient = new Set(
        data.filter((item) => String(item.p) === patientId).map((item) => item.t)
      );
      acc[patientId] = armsInPatient.size;
      return acc;
    }, {} as Record<string, number>);
  }, [data, patientIdsAsStrings]);

  const heatmapMatrixWithColors = useMemo(() => {
    const { trialArms, patients } = sortedData;
  
    // Step 1: Preprocess `data` into a Map
    const dataMap = new Map<string, Set<string>>();
    data.forEach((item) => {
      const trialArmId = item.t;
      const patientId = String(item.p);
      if (!dataMap.has(trialArmId)) {
        dataMap.set(trialArmId, new Set());
      }
      dataMap.get(trialArmId)?.add(patientId);
    });
  
    // Step 2: Now build the matrix
    return trialArms.map((trialArm) =>
      patients.map((patientId) => {
        const isPatientSelected = selectedOptions.includes(patientId);
        const hasData = dataMap.get(trialArm)?.has(patientId) ?? false;
  
        if (isPatientSelected && hasData) {
          return 1;
        }
        if (hasData) {
          return 2;
        }
        return 0;
      })
    );
  }, [data, sortedData, selectedOptions]);

  useEffect(() => {
    // Sort by Trial Id on initial load to make it the default view.
    sortDataByTrialId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortDataByCount = () => {
    // Sort patients by the number of trial arms they are matched to, in descending order.
    const sortedPatients = [...patientIdsAsStrings].sort(
      (a, b) => armCountByPatient[b] - armCountByPatient[a]
    );

    //Sort trial arms by patient count in descending order (most patients first).
    const sortedTrialArms = [...trialArmNames].sort(
      (a, b) => patientCountByArm[a] - patientCountByArm[b]
    );
    
    setSortedData({
      trialArms: sortedTrialArms,
      patients: sortedPatients,
    });
    setIsSorted(true);
  };

  const sortDataByTrialId = () => {
    const sortedTrialArms = [...trialArmNames].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );

    const sortedPatients = [...patientIdsAsStrings].sort(
      (a, b) => armCountByPatient[b] - armCountByPatient[a]
    );
  
    setSortedData({
      trialArms: sortedTrialArms,
      patients: sortedPatients,
    });
    setIsSorted(true);
  };

  const unsortData = () => {
    setSortedData({
        trialArms: trialArmNames,
      patients: patientIdsAsStrings,
    });
    setIsSorted(false);
  };

  const handleClick = (event: any) => {
    if (event.points.length > 0) {
      const patientValue = event.points[0].x;
      const armValue = event.points[0].y;
      const studyValue = getStudyForPoint(armValue, patientValue);
      const cbiPortalUrl= process.env.REACT_APP_CBIOPORTAL_URL
      const link = `${cbiPortalUrl}/patient?studyId=${studyValue}&caseId=${patientValue}`;
      window.open(link, "_blank");
    }
  };

  const getStudyForPoint = (trialArm: string, patientId: string) => {
    const matchingItem = data.find(
      (item) => item.t === trialArm && String(item.p) === patientId
    );
    if (!matchingItem) return "N/A";
    try {
      return matchingItem.s;
    } catch (error) {
      console.error("Error parsing combineddata:", error);

    }
  };

  const getStudyByTrial = (trialArm: string) => {
    const matchingItem = data.find(
      (item) => item.t === trialArm 
    );
    if (!matchingItem) return "";
    try {
      return matchingItem.s;
    } catch (error) {
      console.error("Error parsing combineddata:", error);

    }
  };

  const annotations = sortedData.trialArms.map((label, index) => {
    return {
      x: -0.1,
      y: index,
      xref: "paper" as const, // Explicitly cast to the correct type
      yref: "y" as const, // Explicitly cast to the correct type
      text: label,
      showarrow: false,
      font: {
        size: 12,
      },
      align: "left" as const, // Explicitly cast to the correct type
    };
  });
  

  const rowHeight = 25;
  const chartHeight = rowHeight * trialArmNames.length;
  const columnHeight = 8;
  let chartColumnHeight = patientIds.length > 75 ? 800 : columnHeight * patientIds.length;

  const elementWidth = Number(chartColumnHeight) / patientIdsAsStrings.length;
  const [xgap, setXgap] = useState(elementWidth / 2);

  const handleRelayout = (layout: any) => {
    if (layout["xaxis.range[0]"] && layout["xaxis.range[1]"]) {
      const visibleRange = layout["xaxis.range[1]"] - layout["xaxis.range[0]"];
      const newXgap = Number(chartColumnHeight) / visibleRange / 2;
      setXgap(newXgap);
    }
  };

  const handleChange = (selectedList: any) => {
    setSelectedOptions(selectedList);
  };
 
  return (
    <div className="heatplot-container">
      <div className="filters-container">
        <label>Patient Id's</label>
        <MultiSelect
          id="patientIdsMultiSelect"
          className="fixed-width-select w-full md:w-20rem"
          options={patientIdsAsStrings}
          value={selectedOptions}
          placeholder="Patient Id's"
          display="chip"
          filter
          onChange={(e) => handleChange(e.value)}
        />
        <div className="sort-dropdown-container">
          <label htmlFor="sortDropdown">Sort By:</label>
          <Dropdown
            id="sortDropdown"
            className="w-full md:w-8rem"
            value={selectedSortOption}
            options={[
              { label: "Trial Id", value: "trialId" },
              { label: "Patient Match Count", value: "patientCount" },
              { label: "Default", value: "unsort" },
            ]}
            onChange={(e) => {
              setSelectedSortOption(e.value);
              if (e.value === "trialId") {
                sortDataByTrialId();
              } else if (e.value === "patientCount") {
                sortDataByCount();
              } else if (e.value === "unsort") {
                unsortData();
              }
            }}
            placeholder="Select Sorting Option"
          />
        </div>
      </div>

      <div className="chart-container">
      <Plot
        data={[
          {
            z: heatmapMatrixWithColors,
            x: sortedData.patients,
            y: sortedData.trialArms,
            type: "heatmap",
            colorscale: [
              [0, "lightgrey"],
              [1 / 2, "rgb(255, 0, 0)"],
              [1, "rgb(51, 153, 255)"],
            ],
            showscale: false,
            hovertemplate:
              `<b>Patient ID:</b> %{x}<br>` +
              `<b>Trial Arm:</b> %{y}<br>` +
              //`<b>Matched Data:<br></b>%{customdata}<br>` +
              "<extra></extra>",
            xgap,
            ygap: 6,
            hoverlabel: {
              bgcolor: "white",
              font: {
                color: "black",
                size: 12,
              },
            },
          },
        ]}
        layout={{
          xaxis: { showticklabels: false, type: "category", ticks: "", showgrid: false },
          yaxis: { 
            tickfont: { size: 12 }, 
            type: "category", showticklabels: true, automargin: true, showgrid: false },
          height: 200 + chartHeight,
          width: 200 + Number(chartColumnHeight) + patientIdsAsStrings.length * xgap,
          autosize: false,
          plot_bgcolor: "white",
          paper_bgcolor: "white",
        }}
        onClick={(event) => {
          if (event.points.length > 0) {
            const patientValue = String(event.points[0].x);
            const armValue = String(event.points[0].y);
            const studyValue = String(getStudyForPoint(armValue, patientValue));
            onBarClick(patientValue,studyValue);
          }
        }}
      />
      </div>
    </div>
  );
};

export default HeatmapChart;
