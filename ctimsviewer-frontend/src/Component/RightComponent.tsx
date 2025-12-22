import useAxiosDb from "../service/useAxiosDb";
import React, { useEffect, useState } from "react";
import { ProgressSpinner } from 'primereact/progressspinner';
import './RightComponent.css';
import Popup from 'reactjs-popup';
import { formatInTimeZone} from 'date-fns-tz'; 
import { MdDelete } from "react-icons/md";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";


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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Default items per page
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [globalFilterValue, setGlobalFilterValue] = useState("");
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

  const handleDelete = (selectedTrial: string, trialId: String) => {
    console.log("selectedTrial", selectedTrial);
    const headers: Record<string, string> = {
      'Content-type': 'application/json; charset=UTF-8',
    };

    if (keycloakIntegration !== "disable" && bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    deleteOperation({
      method: 'DELETE',
      url: `delete/${selectedTrial}/${trialId}`,
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
    return formatInTimeZone(dateString + "Z", tz, "MMM d, yyyy, h:mm a");
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCharts = charts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(charts.length / itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  const footer = `Total ${currentCharts ? currentCharts.length : 0} rows.`;

  return (
    <div>
      {groupTrialsError && <div>Error: Unable to fetch the Trials</div>}
      {charts.length > 0 && (
        <>
          <div className="table-toolbar">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  value={globalFilterValue}
                  onChange={(e) => setGlobalFilterValue(e.target.value)}
                  placeholder="Search Trials..."
                  className="search-input"
                />
            </span>
          </div>
          <DataTable value={charts} tableStyle={{ minWidth: "80rem" }} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} footer={footer} globalFilterFields={['trialid', 'trialname', 'username']} globalFilter={globalFilterValue}>
            <Column
              header="ID"
              body={(_, { rowIndex }) => indexOfFirstItem + rowIndex + 1}
            />
            <Column field="trialid" header="Trial ID" sortable/>
            <Column field="trialname" header="Trial Name" sortable/>
            <Column field="trialmatchdate" header="Trial Match Date" sortable/>
            <Column
              field="trialcreated"
              header="Trial Uploaded On"
              body={(rowData) => formatDate(rowData.trialcreated)}
              sortable
            />
            <Column field="uniquearms" header="Unique Arms" sortable/>
            <Column field="uniquepatients" header="Unique Patients" sortable/>
            <Column field="uniquestudyid" header="Unique Studies" sortable/>
            <Column field="username" header="Uploaded User Name" sortable/>
            <Column
              header="Delete"
              body={(rowData) => (
                <Button
                  icon={<MdDelete />}
                  severity="danger"
                  size="small"
                  onClick={() => handleDelete(rowData.trialcreated, rowData.trialid)}
                  className="deleteButton"
                />
              )}
            />
          </DataTable>
        </>
      )}
    </div>
  );
};

export default RightComponent;
