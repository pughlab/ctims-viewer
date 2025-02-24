import React, { useState, useMemo } from "react";
import Plot from "react-plotly.js";

interface DataItem {
  trialarmid: string;
  patient_id: number;
}

interface HeatmapChartProps {
  data: DataItem[];
  study_id: String;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, study_id }) => {
  const trialArmNames = Array.from(new Set(data.map((item) => item.trialarmid)));
  const patientIds = Array.from(new Set(data.map((item) => item.patient_id)));
  const patientIdsAsStrings = patientIds.map(String);
  console.log("Data", data)
  const [isSorted, setIsSorted] = useState(false);
  const [sortedData, setSortedData] = useState({
    trialArms: trialArmNames,
    patients: patientIdsAsStrings,
  });

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
    return trialArmNames.map((trialArm) =>
      patientIdsAsStrings.map((patientId, index) => {
        if (
          data.some(
            (item) => item.trialarmid === trialArm && String(item.patient_id) === patientId
          )
        ) {
          return index % 2 === 0 ? 1 : 2; // Assign values based on index
        }
        return 0; // No match
      })
    );
  }, [data, trialArmNames, patientIdsAsStrings]);

  const sortedHeatmapWithColors = useMemo(() => {
    if (isSorted) {
      const { trialArms, patients } = sortedData;
      return trialArms.map((trialArm) =>
        patients.map((patientId, index) => {
          if (
            data.some(
              (item) => item.trialarmid === trialArm && String(item.patient_id) === patientId
            )
          ) {
            return index % 2 === 0 ? 1 : 2; // Assign values based on index
          }
          return 0;
        })
      );
    }
    return heatmapMatrixWithColors;
  }, [sortedData, isSorted, data, heatmapMatrixWithColors]);

  const sortData = () => {
    const sortedTrialArms = [...trialArmNames].sort(
      (a, b) => patientCountByArm[b] - patientCountByArm[a]
    );
    setSortedData({
      trialArms: sortedTrialArms,
      patients: patientIdsAsStrings,
    });
    setIsSorted(true);
  };

  const sortDataByCount = () => {
    const sortedPatients = [...patientIdsAsStrings].sort(
      (a, b) => armCountByPatient[b] - armCountByPatient[a]
    );
    setSortedData({
      trialArms: trialArmNames,
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
//https://cbioportal.ca/cbioportal/patient?studyId=pog570_bcgsc_2020&caseId=25719
  const handleClick = (event: any) => {
    if (event.points.length > 0) {
      const xValue = event.points[0].x;
      const link = `https://cbioportal.ca/cbioportal/patient?studyId=${study_id}&caseId=${xValue}`;
      window.open(link, "_blank");
    }
  };

  const rowHeight = 25;
  const chartHeight = rowHeight * trialArmNames.length;

  return (
    <div>
      <div style={{ marginBottom: "10px", display: "flex", justifyContent: "left", gap: "20px" }}>
        <button onClick={sortData} disabled={isSorted}>
          Sort By Trial Id
        </button>
        <button onClick={sortDataByCount} disabled={isSorted}>
          Sort By Patient Count
        </button>
        <button onClick={unsortData} disabled={!isSorted}>
          Unsort
        </button>
      </div>
      <Plot
        data={[
          {
            z: sortedHeatmapWithColors,
            x: sortedData.patients,
            y: sortedData.trialArms,
            type: "heatmap",
            colorscale: [
              [0, "lightgrey"],
              [1 / 2, "rgb(51, 75, 255)"],
              [1, "rgb(51, 75, 255)"], 
            ],
            showscale: false,
            hovertemplate:
              `<b>Patient ID:</b> %{x}<br>` +
              `<b>Trial Arm:</b> %{y}<br>` +
              `<b>URL:</b> https://cbioportal.ca/cbioportal/patient?studyId=${study_id}&caseId=%{x}<br>` +
              "<extra></extra>",
            xgap: 1,
            ygap: 10,
          },
        ]}
        layout={{
          //title: "Patient Participation Heatmap",
          xaxis: {
            //title: "Patient ID",
            showticklabels: false,
            type: "category",
            ticks: "",
            showgrid: false,
          },
          yaxis: {
            //title: "Trial Arms",
            tickfont: { size: 10 },
            type: "category",
            showticklabels: true,
            automargin: true,
            showgrid: false,
          },
          height: 200 + chartHeight,
          width: 1200,
          autosize: false,
          plot_bgcolor: "white",
          paper_bgcolor: "white",
        }}
        onClick={handleClick}
      />
    </div>
  );
};

export default HeatmapChart;
