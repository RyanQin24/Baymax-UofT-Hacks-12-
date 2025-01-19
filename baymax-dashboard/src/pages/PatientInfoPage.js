import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth0 } from "@auth0/auth0-react";
import { connectToContract } from "./blockchain"; // Adjust the path as needed


import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";

// Icons
import MedicationIcon from "@mui/icons-material/Medication";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

function PatientInfoPage() {
  const { user, isAuthenticated } = useAuth0();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [prescription, setPrescription] = useState("");
  const [issue, setIssue] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!isAuthenticated || !user) return;

      setLoadingData(true);
      try {
        const userId = user.sub; // Auth0 user ID
        const docRef = doc(db, "patients", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setAge(data.age || "");
          setPrescriptions(data.prescriptions || []);
          setIssues(data.issues || []);
          setMessage("Patient data loaded successfully.");
        } else {
          setMessage("No patient data found.");
        }
      } catch (err) {
        setMessage("Error fetching data: " + err.message);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPatientData();
  }, [user, isAuthenticated]);

  const handleSaveInfo = async () => {
    try {
      if (!user) return;
      const userId = user.sub;
  
      // Save to Firestore
      await setDoc(doc(db, "patients", userId), {
        name,
        age,
        prescriptions,
        issues,
      });
  
      const contract = await connectToContract();
      if (contract) {
        const transaction = await contract.savePatientData(name, age, prescriptions, issues);
        await transaction.wait(); // Waits for the transaction to be mined
        console.log("Transaction completed:", transaction);
      }
  
      console.log("Data saved successfully!");
      setMessage("Patient information saved successfully!");
    } catch (err) {
      console.error("Error saving data:", err.message);
      setMessage("Error saving information: " + err.message);
    }
  };

  const handleAddPrescription = () => {
    if (prescription.trim()) {
      setPrescriptions([...prescriptions, prescription]);
      setPrescription("");
    }
  };

  const handleAddIssue = () => {
    if (issue.trim()) {
      setIssues([...issues, issue]);
      setIssue("");
    }
  };

  const handleRemovePrescription = (indexToRemove) => {
    setPrescriptions((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveIssue = (indexToRemove) => {
    setIssues((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/baymax.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          align="center"
          sx={{
            mb: 3,
            color: "#FF4B4B",
            fontWeight: "bold",
            fontFamily: "'Fredoka', sans-serif",
          }}
        >
          Baymax Patient Info
        </Typography>

        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent>
            {loadingData ? (
              <CircularProgress sx={{ display: "block", margin: "0 auto" }} />
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    InputLabelProps={{ sx: { color: "#FF4B4B" } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Age"
                    fullWidth
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    InputLabelProps={{ sx: { color: "#FF4B4B" } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#4B4BFF", fontWeight: "bold" }}
                  >
                    Prescriptions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <TextField
                        label="Add Prescription"
                        fullWidth
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#FF4B4B",
                          color: "#ffffff",
                          borderRadius: 2,
                          fontWeight: "bold",
                          height: "100%",
                        }}
                        onClick={handleAddPrescription}
                        fullWidth
                      >
                        <AddIcon fontSize="small" />
                        Add
                      </Button>
                    </Grid>
                  </Grid>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 2, flexWrap: "wrap" }}
                  >
                    {prescriptions.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        icon={<MedicationIcon />}
                        onDelete={() => handleRemovePrescription(index)}
                        deleteIcon={<DeleteIcon />}
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#4B4BFF", fontWeight: "bold" }}
                  >
                    Health Issues
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <TextField
                        label="Add Health Issue"
                        fullWidth
                        value={issue}
                        onChange={(e) => setIssue(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#FF4B4B",
                          color: "#ffffff",
                          borderRadius: 2,
                          fontWeight: "bold",
                          height: "100%",
                        }}
                        onClick={handleAddIssue}
                        fullWidth
                      >
                        <AddIcon fontSize="small" />
                        Add
                      </Button>
                    </Grid>
                  </Grid>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 2, flexWrap: "wrap" }}
                  >
                    {issues.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        icon={<MedicalServicesIcon />}
                        onDelete={() => handleRemoveIssue(index)}
                        deleteIcon={<DeleteIcon />}
                        color="secondary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#4B4BFF",
                      color: "#ffffff",
                      borderRadius: 3,
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      py: 1.5,
                    }}
                    fullWidth
                    onClick={handleSaveInfo}
                    disabled={isSaving}
                    startIcon={isSaving && <CircularProgress size={20} />}
                  >
                    {isSaving ? "Saving..." : "Save Patient Info"}
                  </Button>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {message && (
          <Alert
            severity={message.includes("Error") ? "error" : "success"}
            sx={{ mt: 3, fontWeight: "bold" }}
          >
            {message}
          </Alert>
        )}
      </Container>
    </Box>
  );
}

export default PatientInfoPage;
