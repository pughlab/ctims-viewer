import useAxiosDb from "../service/useAxiosDb";
import React, { useEffect, useState } from "react";
import { ProgressSpinner } from 'primereact/progressspinner';
import './RightComponent.css'; // Import the CSS file
import Popup from 'reactjs-popup';
import { format } from 'date-fns'; 
import { MdDelete } from "react-icons/md";
import { classNames } from "primereact/utils";

interface ChartData {
  uniquearms: number;
  uniquepatients: number;
  trialcreated: string;
  username: string;
  trialid: String;
  trialmatchdate: String;
  uniquestudyid: number;
  trialname: String;
}

const RightComponent = (props: any) => {
  const { response: groupTrialsResponse, loading: groupTrialsLoading, error: groupTrialsError, operation: groupTrialsOperation } = useAxiosDb();
  const { response: getTrialResponse, loading: getTrialLoading, error: getTrialError, operation: getTrialOperation } = useAxiosDb();
  const { response: deleteResponse, loading: deleteLoading, error: deleteError, operation: deleteOperation } = useAxiosDb();

  const bearerToken = props.accessToken;
  const onCheckboxChange = props.onCheckboxChange;
  const keycloakIntegration = process.env.REACT_APP_KEYCLOAK_REALM;

  const [charts, setCharts] = useState<ChartData[]>([]);
  const [selectedTrials, setSelectedTrials] = useState<string[]>([]); // State to track selected trials
  const [trial, setTrial] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    handleChartValidate();
  }, []);

  useEffect(() => {
    if (groupTrialsResponse) {
      setCharts(groupTrialsResponse as ChartData[]);
      console.log("groupTrialsResponse123", groupTrialsResponse);
    }
  }, [groupTrialsResponse]);

  useEffect(() => {
    if (selectAll) {
      setSelectedTrials(charts.map(chart => chart.trialcreated));
    } else {
      setSelectedTrials([]);
    }
  }, [selectAll, charts]);

  useEffect(() => {
    handleChartValidate();
  }, [deleteResponse]);

  const handleChartValidate = () => {
    const headers: Record<string, string> = {
      'Content-type': 'application/json; charset=UTF-8',
    };
    if (keycloakIntegration !== "disable" && bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    groupTrialsOperation({
      method: 'GET',
      url: `groupTrials`,
      headers: headers,
    });
  };

  const handleTrialData = () => {
    const headers: Record<string, string> = {
      'Content-type': 'application/json; charset=UTF-8',
    };
    if (keycloakIntegration !== "disable" && bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    getTrialOperation({
      method: 'GET',
      url: `viewTrialData/{trial}`,
      headers: headers,
    });
  };

  const handleCheckboxChange = (trialCreated: string) => {
    let updatedSelections = [...selectedTrials];
    if (updatedSelections.includes(trialCreated)) {
      updatedSelections = updatedSelections.filter(trial => trial !== trialCreated);
    } else {
      updatedSelections.push(trialCreated);
    }
    setSelectedTrials(updatedSelections);
    onCheckboxChange(updatedSelections);
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      onCheckboxChange(charts.map(chart => chart.trialcreated));
    } else {
      onCheckboxChange([]);
    }
  };

  const handleDelete = (selectedTrial: string) => {
    console.log("selectedTrial", selectedTrial);
    const headers: Record<string, string> = {
      'Content-type': 'application/json; charset=UTF-8',
    };

    if (keycloakIntegration !== "disable" && bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    deleteOperation({
      method: 'DELETE',
      url: 'delete/' + selectedTrial,
      headers: headers,
    }).then(() => {
      // After successful deletion, reload the folder list
    }).catch(error => {
      console.error('Error deleting folder:', error);
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      // If dateString is undefined, null, or an empty string, return a default value
      return "Invalid date";
    }
    const [datePart, timePart] = dateString.split('.');
    return format(new Date(datePart), "MMM d, yyyy, h:mm a");
  };

  const DataPopup = (trialmatchdate: any) => {
    console.log("handleTrialChange", trialmatchdate.trialmatchdate);
    // handleTrialChange(trialmatchdate.trialmatchdate);
    return (
      <>
        <h1>Table</h1>
      </>
    );
  };

  return (
    <div>
      {groupTrialsError && <div>Error: Unable to fetch the Trials</div>}
      {charts.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Trial ID</th>
              <th>Trial Name</th>
              <th>Trial Match Date</th>
              <th>Trial Uploaded On</th>
              <th>Unique Arms</th>
              <th>Unique Patients</th>
              <th>Unique Studies</th>
              <th>Uploaded User Name</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {charts.map((chart, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{chart.trialid}</td>
                <td>{chart.trialname}</td>
                <td>{chart.trialmatchdate}</td>
                <td>{formatDate(chart.trialcreated)}</td>
                <td>{chart.uniquearms}</td>
                <td>{chart.uniquepatients}</td>
                <td>{chart.uniquestudyid}</td>
                <td>{chart.username}</td>
                <td><button  className="deleteButton" onClick={() => handleDelete(chart.trialcreated) }><MdDelete /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RightComponent;
