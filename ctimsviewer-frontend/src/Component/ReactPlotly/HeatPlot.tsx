import React, { useState, useMemo, useEffect } from "react";
import Plot from "react-plotly.js";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import "./HeatPlot.css";

interface DataItem {
  trialarmid: string;
  patient_id: number;
  combineddata: string;
  studyid: string;
}

interface HeatmapChartProps {
  data: DataItem[];
  study_id: string;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, study_id }) => {
  const trialArmNames = Array.from(new Set(data.map((item) => item.trialarmid)));
  const patientIds = Array.from(new Set(data.map((item) => item.patient_id)));
  const patientIdsAsStrings = patientIds.map(String);
  const [isSorted, setIsSorted] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedSortOption, setSelectedSortOption] = useState("unsort");
  const [sortedData, setSortedData] = useState({
    trialArms: trialArmNames,
    patients: patientIdsAsStrings,
  });

  useEffect(() => {
    const sortedTrialArms = [...trialArmNames].sort(
      (a, b) => patientCountByArm[a] - patientCountByArm[b]
    );

    const sortedPatients = [...patientIdsAsStrings].sort(
      (a, b) => armCountByPatient[b] - armCountByPatient[a]
    );
    setSortedData({
      trialArms: sortedTrialArms,
      patients: sortedPatients,
    });
    
  }, []);



  const patientCountByArm = useMemo(() => {
    return trialArmNames.reduce((acc, trialArm) => {
      const patientsInArm = new Set(
        data.filter((item) => item.trialarmid === trialArm).map((item) => item.patient_id)
      );
      acc[trialArm] = patientsInArm.size;
      return acc;
    }, {} as Record<string, number>);
  }, [data, trialArmNames]);

  const armCountByPatient = useMemo(() => {
    return patientIdsAsStrings.reduce((acc, patientId) => {
      const armsInPatient = new Set(
        data.filter((item) => String(item.patient_id) === patientId).map((item) => item.trialarmid)
      );
      acc[patientId] = armsInPatient.size;
      return acc;
    }, {} as Record<string, number>);
  }, [data, patientIdsAsStrings]);

  const heatmapMatrixWithColors = useMemo(() => {
    const { trialArms, patients } = sortedData;
    return trialArms.map((trialArm) =>
    patients.map((patientId) => {
        const isPatientSelected = selectedOptions.includes(patientId);

        if (isPatientSelected &&  data.some(
          (item) => item.trialarmid === trialArm && String(item.patient_id) === patientId
        )) {
          return 1;
        }
        if (
          data.some(
            (item) => item.trialarmid === trialArm && String(item.patient_id) === patientId
          )
        ) {
          return 2;
        }
        return 0;
      })
    );
  }, [data, trialArmNames, patientIdsAsStrings, selectedOptions]);

  const sortedHeatmapWithColors = useMemo(() => {
    if (isSorted) {
      const { trialArms, patients } = sortedData;
      return trialArms.map((trialArm) =>
        patients.map((patientId) => {
          const isPatientSelected = selectedOptions.includes(patientId);
          if (isPatientSelected && data.some(
            (item) => item.trialarmid === trialArm && String(item.patient_id) === patientId
          )) {
            return 1;
          }
          if (
            data.some(
              (item) => item.trialarmid === trialArm && String(item.patient_id) === patientId
            )
          ) {
            return 2;
          }
          return 0;
        })
      );
    }
    return heatmapMatrixWithColors;
  }, [sortedData, isSorted, data, heatmapMatrixWithColors, selectedOptions]);

  const sortDataByCount = () => {
    const sortedPatients = [...patientIdsAsStrings].sort(
      (a, b) => armCountByPatient[b] - armCountByPatient[a]
    );

    const sortedTrialArms = [...trialArmNames].sort(
      (a, b) => patientCountByArm[a] - patientCountByArm[b]
    );
    
    setSortedData({
      trialArms: trialArmNames,
      patients: sortedPatients,
    });
    setIsSorted(true);
  };

  const sortDataByTrialId = () => {
    const sortedTrialArms = [...trialArmNames].sort((a, b) => {
      const getNameAndNumber = (id: string): [string, number] => {
        const match = id.match(/^([a-zA-Z]+)(\d+)$/);
        return match ? [match[1], parseInt(match[2], 10)] : [id, 0];
      };
  
      const [nameA, numA] = getNameAndNumber(a);
      const [nameB, numB] = getNameAndNumber(b);
  
      if (nameA === nameB) {
        return numA - numB; // Sort by number if names are the same
      }
      return nameA.localeCompare(nameB); // Sort by name otherwise
    });

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
    const sortedTrialArms = [...trialArmNames].sort(
      (a, b) => patientCountByArm[a] - patientCountByArm[b]
    );

    const sortedPatients = [...patientIdsAsStrings].sort(
      (a, b) => armCountByPatient[b] - armCountByPatient[a]
    );
    setSortedData({
      trialArms: sortedTrialArms,
      patients: sortedPatients,
    });
    setIsSorted(false);
  };

  const handleClick = (event: any) => {
    if (event.points.length > 0) {
      const patientValue = event.points[0].x;
      const armValue = event.points[0].y;
      const studyValue = getStudyForPoint(armValue, patientValue);
      const link = `https://cbioportal.ca/cbioportal/patient?studyId=${studyValue}&caseId=${patientValue}`;
      window.open(link, "_blank");
    }
  };

  const getCombinedDataForPoint = (trialArm: string, patientId: string) => {
    const matchingItem = data.find(
      (item) => item.trialarmid === trialArm && String(item.patient_id) === patientId
    );
    if (!matchingItem) return "N/A";
    try {
      const parsedData = JSON.parse(matchingItem.combineddata.replace(/'/g, '"'));
      return Object.entries(parsedData)
        .map(([key, value]) => `  <b>${key}:</b> ${value}`)
        .join("<br>");
    } catch (error) {
      console.error("Error parsing combineddata:", error);
      return matchingItem.combineddata;
    }
  };

  const getStudyForPoint = (trialArm: string, patientId: string) => {
    const matchingItem = data.find(
      (item) => item.trialarmid === trialArm && String(item.patient_id) === patientId
    );
    if (!matchingItem) return "N/A";
    try {
      return matchingItem.studyid;
    } catch (error) {
      console.error("Error parsing combineddata:", error);

    }
  };

  const getStudyByTrial = (trialArm: string) => {
    const matchingItem = data.find(
      (item) => item.trialarmid === trialArm 
    );
    if (!matchingItem) return "";
    try {
      return matchingItem.studyid;
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
        size: 10,
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
    console.log("Test123")
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
              { label: "IDSort", value: "trialId" },
              { label: "PatientCount", value: "patientCount" },
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
            z: sortedHeatmapWithColors,
            x: sortedData.patients,
            y: sortedData.trialArms,
            type: "heatmap",
            colorscale: [
              [0, "lightgrey"],
              [1 / 2, "rgb(255, 0, 0)"],
              [1, "rgb(51, 75, 255)"],
            ],
            showscale: false,
            hovertemplate:
              `<b>Patient ID:</b> %{x}<br>` +
              `<b>Trial Arm:</b> %{y}<br>` +
              //`<b>Matched Data:<br></b>%{customdata}<br>` +
              "<extra></extra>",
            xgap,
            ygap: 10,
            customdata: sortedData.trialArms.map((trialArm) =>
              sortedData.patients.map((patientId) =>
                getCombinedDataForPoint(trialArm, patientId)
              )
            ),
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
            //tickvals: sortedData.trialArms,
            //ticktext: [],
            tickfont: { size: 10,
           }, 
           type: "category", showticklabels: true, automargin: true, showgrid: false },
          height: 200 + chartHeight,
          width: 200 + Number(chartColumnHeight) + patientIdsAsStrings.length * xgap,
          autosize: false,
          plot_bgcolor: "white",
          paper_bgcolor: "white",
        }}
        onClick={handleClick}
      />
      </div>
    </div>
  );
};

export default HeatmapChart;
