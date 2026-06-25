import React, { useState, useMemo, useEffect } from "react";
import Plot from "react-plotly.js";
import oncotreeMapping from "./oncotree_mapping_high.json";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import "./PlotStyles.css";

interface DataItem {
  t: string;
  p: number;
  s: string;
  d: string;
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
  const [selectedXAxisSortOption, setSelectedXAxisSortOption] = useState("matchCount");
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

  const oncoRootKeys = useMemo(() => Object.keys(oncotreeMapping), []);

  const detailToRootMap = useMemo(() => {
    const m = new Map<string, string>();
    oncoRootKeys.forEach((root) => {
      const arr = (oncotreeMapping as Record<string, string[]>)[root] || [];
      arr.forEach((d) => m.set(d, root));
    });
    return m;
  }, [oncoRootKeys]);

  const cCategories = useMemo(
    () => Array.from(new Set(data.map((item) => detailToRootMap.get(item.d) || item.d))),
    [data, detailToRootMap]
  );

  const allSameC = cCategories.length === 1;

  const cIndexMap = useMemo(() => {
    return oncoRootKeys.reduce<Record<string, number>>((acc, root, idx) => {
      acc[root] = idx + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [oncoRootKeys]);

  const heatmapColorscale = useMemo((): [number, string][] => {
    if (allSameC) {
      return [
        [0, "lightgrey"],
        [1, "rgb(51, 153, 255)"],
      ];
    }

    // generate a palette sized to the number of oncotree root keys
    const numRoots = oncoRootKeys.length;
    const palette: string[] = Array.from({ length: numRoots }).map((_, idx) => {
      const hue = Math.round((idx * 360) / Math.max(1, numRoots));
      return `hsl(${hue},70%,50%)`;
    });

    const stops = oncoRootKeys.map((_, idx) => [
      (idx + 1) / numRoots,
      palette[idx % palette.length],
    ] as [number, string]);

    return [[0, "lightgrey"], ...stops];
  }, [allSameC, cCategories, oncoRootKeys]);

  const trialPatientDataMap = useMemo(() => {
    const map = new Map<string, Map<string, string>>();
    data.forEach((item) => {
      const trialArmId = item.t;
      const patientId = String(item.p);
      if (!map.has(trialArmId)) {
        map.set(trialArmId, new Map());
      }
      map.get(trialArmId)!.set(patientId, item.d);
    });
    return map;
  }, [data]);

  const trialPatientRootMap = useMemo(() => {
    const map = new Map<string, Map<string, string>>();
    data.forEach((item) => {
      const trialArmId = item.t;
      const patientId = String(item.p);
      if (!map.has(trialArmId)) {
        map.set(trialArmId, new Map());
      }
      const root = detailToRootMap.get(item.d) || item.d;
      map.get(trialArmId)!.set(patientId, root);
    });
    return map;
  }, [data, detailToRootMap]);

  const heatmapMatrixWithColors = useMemo(() => {
    const { trialArms, patients } = sortedData;
    return trialArms.map((trialArm) =>
      patients.map((patientId) => {
        const cValue = trialPatientRootMap.get(trialArm)?.get(patientId);
        return cValue ? cIndexMap[cValue] : 0;
      })
    );
  }, [sortedData, cIndexMap, trialPatientRootMap]);

  const customDataMatrix = useMemo(() => {
    const { trialArms, patients } = sortedData;
    return trialArms.map((trialArm) =>
      patients.map((patientId) => trialPatientDataMap.get(trialArm)?.get(patientId) || "")
    );
  }, [sortedData, trialPatientDataMap]);

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

  const sortXAxisByMatchCount = () => {
    const sortedPatients = [...sortedData.patients].sort(
      (a, b) => armCountByPatient[b] - armCountByPatient[a]
    );
    setSortedData({
      trialArms: sortedData.trialArms,
      patients: sortedPatients,
    });
  };

  const sortXAxisByDiagnosis = () => {
    const sortedPatients = [...sortedData.patients].sort((a, b) => {
      const diagnosisA = trialPatientDataMap.get(sortedData.trialArms[0])?.get(a) || "";
      const diagnosisB = trialPatientDataMap.get(sortedData.trialArms[0])?.get(b) || "";
      return diagnosisA.localeCompare(diagnosisB);
    });
    setSortedData({
      trialArms: sortedData.trialArms,
      patients: sortedPatients,
    });
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

    const getDiagnosisForPoint = (trialArm: string, patientId: string) => {
    const matchingItem = data.find(
      (item) => item.t === trialArm && String(item.p) === patientId
    );
    if (!matchingItem) return "N/A";
    try {
      return matchingItem.d;
    } catch (error) {
      console.error("Error in getDiagnosisForPoint finding diagnosis:", error);

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
          <label htmlFor="sortDropdown">Sort Y-Axis By:</label>
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
        <div className="sort-dropdown-container">
          <label htmlFor="xAxisSortDropdown">Sort X-Axis By:</label>
          <Dropdown
            id="xAxisSortDropdown"
            className="w-full md:w-8rem"
            value={selectedXAxisSortOption}
            options={[
              { label: "Match Count", value: "matchCount" },
              { label: "Diagnosis", value: "diagnosis" },
            ]}
            onChange={(e) => {
              setSelectedXAxisSortOption(e.value);
              if (e.value === "matchCount") {
                sortXAxisByMatchCount();
              } else if (e.value === "diagnosis") {
                sortXAxisByDiagnosis();
              }
            }}
            placeholder="Select X-Axis Sorting Option"
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
            customdata: customDataMatrix,
            type: "heatmap",
            colorscale: heatmapColorscale,
            showscale: false,
            hovertemplate:
              `<b>Patient ID:</b> %{x}<br>` +
              `<b>Trial Arm:</b> %{y}<br>` +
              `<b>Diagnosis:</b> %{customdata}<br>` +
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
