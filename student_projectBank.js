import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Typography, Paper, IconButton, Box, Collapse, Button, Checkbox } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { DataGrid } from '@mui/x-data-grid';
import RequestFormModal from './RequestFormModal';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import './student_projectBank.css'
const ProjectBank = () => {
    const { userId } = useParams();
    const [projects, setProjects] = useState([]);
    const [likedProjects, setLikedProjects] = useState([]);
    const [isRequestFormOpen, setIsRequestFormOpen] = useState(false); 
    const [selectedProject, setSelectedProject] = useState(null); // Define selectedProject state
    const [draftDetails, setDraftDetails] = useState(null);
    const [sentRequests, setSentRequests] = useState([]);
    const [projectStatuses, setProjectStatuses] = useState({});
    const [showLikedProjects, setShowLikedProjects] = useState(false);
    useEffect(() => {
        const fetchProjectBankData = async () => {
            try {
                const response = await axios.get(`https://project-bridge-backend.onrender.com/students/projectBank/${userId}`);
                console.log('Project Bank Data:', response.data);
                setProjects(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchLikedProjects = async () => {
            try {
                const response = await axios.get(`https://project-bridge-backend.onrender.com/students/getLiked/${userId}`);
                console.log('Liked Projects Data:', response.data);
                setLikedProjects(response.data);
            } catch (error) {
                console.error(error);
            }
        };
    

        fetchProjectBankData();
        fetchLikedProjects();
        // fetchProjectStatuses();
    }, [userId]); 
    
   useEffect(() => {
        const fetchProjectStatuses = async () => {
            try {
                const requests = projects.map(project => axios.get(`https://project-bridge-backend.onrender.com/students/getProjectStatus/${userId}/${project.projectId}`));
                const responses = await Promise.all(requests);
                const statuses = responses.reduce((acc, response, index) => {
                    const project = projects[index];
                    acc[project.projectId] = response.data.projectStatus;
                    return acc;
                }, {});
                setProjectStatuses(statuses);
            } catch (error) {
                console.error("Error fetching project statuses:", error);
            }
        };
    
        if (projects.length > 0) {
            fetchProjectStatuses();
        }
    }, [projects, userId]); 
    

    useEffect(() => {
        if (projects.length > 0) {
            const fetchSentRequests = async () => {
                try {
                    const requests = {};
                    for (const project of projects) {
                        const response = await axios.get(`https://project-bridge-backend.onrender.com/requests/sentRequests/${project.projectId}/${userId}`);
                        requests[project.projectId] = response.data ? true : false;
                    }
                    setSentRequests(requests);
                } catch (error) {
                    console.error("Error fetching sent requests:", error);
                }
            };
    
            fetchSentRequests();
        }
    }, [projects, userId]);
    
    const handleLike = async (projectId, isChecked) => {
        try {
            if (isChecked) {
                await axios.post(`https://project-bridge-backend.onrender.com/students/saveLiked/${userId}/${projectId}`);
                setLikedProjects([...likedProjects, { projectId }]);
            } else {
                await axios.delete(`https://project-bridge-backend.onrender.com/students/removeLiked/${userId}/${projectId}`);
                setLikedProjects(likedProjects.filter(project => project.projectId !== projectId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleLikedProjects = () => {
        setShowLikedProjects(!showLikedProjects);
    };


    const updateProjectStatus = (projectId, status) => {
        setProjectStatuses(prevStatuses => ({
            ...prevStatuses,
            [projectId]: status
        }));
    };
    
    const Row = ({ project , projectStatuses }) => {
        const [open, setOpen] = useState(false);
        if (!project || !project.project_name) {
            return null; // Return null or some fallback JSX if project is null or undefined, or if project_name is not present
        }
        const isLiked = likedProjects.some(liked => liked.projectId === project.project_name);
    
        const isRequestSent = sentRequests[project.projectId];

        const projectStatus = projectStatuses[project.projectId];

        // This line is causing the error
    
        const handleRequest = (projectData) => {
            setSelectedProject(projectData); // Set selectedProject when request button is clicked
            setIsRequestFormOpen(true); 
        };
        
        
    
        return (
            <>
                {(!showLikedProjects || isLiked) && (
                    <>
                        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                            <TableCell>
                                <IconButton
                                    aria-label="expand row"
                                    size="small"
                                    onClick={() => setOpen(!open)}
                                    id='collapse_btn'
                                >
                                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {project.project_name}
                            </TableCell>
                            <TableCell>{project.project_description}</TableCell>
                            <TableCell>{project.project_type}</TableCell>
                            <TableCell>{project.project_domain}</TableCell>
                            <TableCell>{project.teacher_name}</TableCell>
                            <TableCell>{project.department}</TableCell>
                            <TableCell>{project.pre_requisites.join(', ')}</TableCell>
                            <TableCell>{project.cg_cutoff}</TableCell>
                            <TableCell>{project.cg_eligibility}</TableCell>
                            <TableCell>{projectStatus}</TableCell>
                            <TableCell>
                                <Checkbox
                                    checked={isLiked}
                                    onChange={(event) => handleLike(project.project_name, event.target.checked)}
                                />
                            </TableCell>
                        </TableRow>
                        {open && (
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
                                    <Collapse in={open} timeout="auto" unmountOnExit>
                                        <Box sx={{ margin: 1 }}>
                                            <Typography variant="h6" gutterBottom component="div">
                                                Project Details
                                            </Typography>
                                            <Typography>{`Project Description: ${project.project_description}`}</Typography>
                                            <Typography>{`Pre-requisites: ${project.pre_requisites.join(', ')}`}</Typography>
                                            <Typography>{`CG Cutoff: ${project.cg_cutoff}`}</Typography>
                                            <Typography>{`CG Eligibility: ${project.cg_eligibility}`}</Typography>
                                            {/* <Button onClick={() => handleRequest(project)} variant="contained" color="primary">Request</Button> */}
                                            {/* Render other project details here */}
                                            <Stack direction="row" spacing={1}>
                                                {isRequestSent ? (
                                                    <Chip label="Request Already Sent" color="success" variant="outlined" />
                                                ) : (
                                                    <Button onClick={() => handleRequest(project)} variant="contained" color="primary">Request</Button>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        )}
                    </>
                )}
            </>
        );
        
    };
    
    

    const appliedProjects = projects.filter(project => sentRequests[project.projectId]);
    const unappliedProjects = projects.filter(project => !sentRequests[project.projectId]);

    return (
        <div>
            <h1>Project Bank</h1>
            <Button onClick={toggleLikedProjects}>
                {showLikedProjects ? 'Show All Projects' : 'Show Liked Projects Only'}
            </Button>

            <h2>Applied Projects</h2>
            <TableContainer component={Paper} id="main_table">
                <Table aria-label="collapsible table">
                    <TableHead>
                        {/* Render table headers */}
                    </TableHead>
                    <TableBody>
                        {appliedProjects.map((project, index) => (
                            <Row key={index} project={project} projectStatuses={projectStatuses} updateProjectStatus={updateProjectStatus} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <h2>Unapplied Projects</h2>
            <TableContainer component={Paper} id="main_table">
                <Table aria-label="collapsible table">
                    <TableHead>
                        {/* Render table headers */}
                    </TableHead>
                    <TableBody>
                        {unappliedProjects.map((project, index) => (
                            <Row key={index} project={project} projectStatuses={projectStatuses} updateProjectStatus={updateProjectStatus} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {isRequestFormOpen && (
                <RequestFormModal
                    visible={isRequestFormOpen}
                    onClose={() => setIsRequestFormOpen(false)}
                    project={selectedProject}
                    userId={userId}
                    selectedProject={selectedProject}
                    draftDetails={draftDetails}
                    setSentRequests={setSentRequests}
                    sentRequests={sentRequests}
                    setProjectStatuses={setProjectStatuses}
                    projectStatuses={projectStatuses}
                />
            )}
        </div>
    );
};


export default ProjectBank;
