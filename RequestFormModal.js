import React, { useState, useEffect } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormTextarea,
} from "@coreui/react";
import {
  CFormInput,
  // CFormSelect,
  // CInputGroup,
  // CContainer,
  // CRow,
  // CCol,
  // CBadge,
  // CCloseButton,
} from "@coreui/react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
// import Box from '@mui/material/Box';
// import TextField from "@mui/material/TextField";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import AlertTitle from "@mui/material/AlertTitle";
import Alert from "./Alert";
import "./RequestFormModal.css";

const RequestFormModal = ({
  visible,
  onClose,
  project,
  userId,
  selectedProject,
  setSentRequests, // Receive setSentRequests as prop
  sentRequests, // Receive sentRequests as prop
  setProjectStatuses, 
  projectStatuses
}) => {
  // console.log("ProjectData:", selectedProject);
  const [formData, setFormData] = useState({
    projectName: project.project_name || "",
    projectDescription: project.project_description || "",
    whyWantToDoProject: "",
    selectedPrerequisites: [], // State to store selected prerequisites
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [draftDetails, setDraftDetails] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarTitle, setSnackbarTitle] = useState("");
  const [alertStyle, setAlertStyle] = useState("");
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [projectStatuses, setProjectStatuses] = useState(false);

  useEffect(() => {
    // Fetch draft details when component mounts
    fetchDraftDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  const fetchDraftDetails = async () => {
    try {
      // Fetch draft details from the backend
      const response = await axios.get(
        `https://project-bridge-backend.onrender.com/students/getDraft/${userId}/${project.projectId}`
      );
      const draft = response.data;
      // Update form data with draft details if draft exists
      if (draft) {
        setFormData({
          projectName: draft.projectName || "",
          projectDescription: draft.projectDescription || "",
          whyWantToDoProject: draft.reason_to_do_project || "",
          selectedPrerequisites: draft.pre_requisites_fulfilled || [],
        });
        setDraftDetails(draft); // Store draft details in state
      }
    } catch (error) {
      console.error("Error fetching draft details:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePrerequisitesChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      selectedPrerequisites: value,
    });
  };

  const handleSubmit = (event) => {
    // Show confirmation message if the form is validated
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      // If the form is not valid, prevent the default form submission behavior
      event.preventDefault();
      event.stopPropagation();
      console.log("Invalid Form");
    }
    // Always set validated to true to display any validation feedback
    setValidated(true);
    setShowConfirmation(true);
  };
  
  const handleConfirmSendRequest = async () => {
    try {
      setIsLoading(true);
      const requestData = {
        studentId: userId,
        reason_to_do_project: formData.whyWantToDoProject,
        pre_requisites_fullfilled: formData.selectedPrerequisites,
      };
  
      // Send the request to store the request data
      await axios.post(
        `https://project-bridge-backend.onrender.com/requests/storeRequest/${selectedProject.projectId}/${userId}`,
        requestData
      );
  
      // Update the sentRequests state after sending the request
      setSentRequests({
        ...sentRequests,
        [selectedProject.projectId]: true,
      });
      
      setProjectStatuses({
        ...projectStatuses,
        [selectedProject.projectId]: "Request Sent",
    });

      // Call the API to delete the draft
      await axios.delete(`https://project-bridge-backend.onrender.com/students/deleteDraft/${userId}/${selectedProject.projectId}`);
  
      // Show success message
      setSnackbarSeverity("success");
      setSnackbarTitle("Success");
      setSnackbarMessage("Request sent successfully");
      setAlertStyle({
        backgroundColor: "#ddffdd",
        color: "green",
      });
      setSnackbarOpen(true);
  
      // Close modal after 5 seconds
      setTimeout(() => {
        onClose();
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      // Handle error
      setSnackbarSeverity("error");
      setSnackbarTitle("Failure");
      setSnackbarMessage("Error sending request");
      console.error("Error sending request:", error);
      setAlertStyle({
        backgroundColor: "#ffdddd",
        color: "red",
      });
      setSnackbarOpen(true); // Open Snackbar for error case
    }
  };
  
  
  
  

  const handleBack = () => {
    // Hide confirmation message
    setShowConfirmation(false);
  };

  const handleSaveDraft = async () => {
    try {
      await axios.post(`https://project-bridge-backend.onrender.com/students/saveDraft/${userId}/${selectedProject.projectId}`, {
        // studentId: userId,
        // projectId: selectedProject.projectId,
        projectName: selectedProject.project_name,
        projectDescription: selectedProject.project_description,
        whyWantToDoProject: formData.whyWantToDoProject,
        selectedPrerequisites: formData.selectedPrerequisites,
      });

      // Update the projectStatuses state after saving the draft
      setProjectStatuses({
          ...projectStatuses,
          [selectedProject.projectId]: "Request Drafted",
      });
      setSnackbarSeverity("success");
      setSnackbarTitle("Success");
      setSnackbarMessage("Draft saved successfully");
      setAlertStyle({
        backgroundColor: "#ddffdd",
        color: "green",
      });
      console.log("success log");
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarTitle("Failure");
      setSnackbarMessage("Error saving draft");
      setAlertStyle({
        backgroundColor: "#ffdddd",
        color: "red",
      });
      console.error("Error saving draft:", error);
      console.log("failure log");
    }
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={onClose}
        aria-labelledby="RequestFormModalTitle"
      >
        <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          id="request_form"
        >
          <CModalHeader closeButton>
            <CModalTitle id="RequestFormModalTitle">Request Form</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {/* Form fields */}
            <CFormInput
              // labelId="name-label"
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              placeholder="Project Name"
              id="outlined-disabled"
              // label="Project Name"
              floatingLabel="Project Name"
              defaultValue="Hello World"
              style={{ marginTop: "25px", width: '100%' }}
              disabled
            />
            <CFormTextarea
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleInputChange}
              placeholder="Project Description"
              id="outlined-disabled"
              // label="Project Description"
              floatingLabel="Project Description"
              defaultValue="Hello World"
              style={{ marginTop: "25px" , width: '100%', minHeight: '150px' }}
              // multiline
              // maxRows={4}
              // rows={4}
              disabled
            />
            <CFormTextarea
              name="whyWantToDoProject"
              value={formData.whyWantToDoProject}
              disabled={isLoading}
              onChange={handleInputChange}
              placeholder="Why do you want to do this project?"
              id="outlined"
              floatingLabel="Why do you want to do this project?"
              style={{ height: "100px", marginTop: "25px" , width: '100%'}}
              feedbackvalid="Looks good!"
              feedbackinvalid="Please fill the reason."
              required
              // defaultValue="Hello World"
            />
            {/* Multi-select input for prerequisites */}
            <FormControl style={{ m: 1, width: "100%", marginTop: "2rem" }}>
              <InputLabel id="prerequisites-label">Prerequisites</InputLabel>
              <Select
                labelId="prerequisites-label"
                id="prerequisites-select"
                disabled={isLoading}
                multiple
                value={formData.selectedPrerequisites}
                onChange={handlePrerequisitesChange}
                renderValue={(selected) => (
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        style={{ margin: "2px" }}
                      />
                    ))}
                  </div>
                )}
              >
                {project.pre_requisites.map((prerequisite) => (
                  <MenuItem key={prerequisite} value={prerequisite}>
                    {prerequisite}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CModalBody>
          <CModalFooter>
            {!showConfirmation ? (
              <React.Fragment>
                <CButton color="secondary" onClick={onClose} disabled={isLoading}>
                  Close
                </CButton>
                <CButton color="primary" onClick={handleSaveDraft} disabled={isLoading}>
                  Save Draft
                </CButton>
                <CButton color="warning" onClick={handleSubmit} disabled={isLoading}>
                  Send Request
                </CButton>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <CButton color="secondary" onClick={handleBack} disabled={isLoading}>
                  Back
                </CButton>
                <CButton color="success" onClick={handleConfirmSendRequest} disabled={isLoading}>
                  Confirm Send Request
                </CButton>
              </React.Fragment>
            )}
          </CModalFooter>
        </CForm>
      </CModal>
      <Snackbar
        id="alert_snackbar"
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          id="alert_toast"
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          style={alertStyle}
        >
          <AlertTitle>{snackbarTitle}</AlertTitle>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RequestFormModal;
