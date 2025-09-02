import React, { useState, useEffect } from "react";
import { Table, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaChevronRight, FaArrowRight, FaEdit } from "react-icons/fa";
import TopBar from "../Common/Topbar";
import MainNav from "../Common/MainNav";
import MasterNav from "./MasterNav";
import "./MaterPipeline.css";

// import axios from "axios";
import axios from "axios";
import { toast } from "react-toastify";

// PipelineItem interface defined outside to reuse
interface CreatePipelineItem {
  _id: string;
  name: string;
  // status: string;
  createdby?: string;
  createdon: string;
  updatedAt?: string;
  noOfMod: number;
}

const MasterPipeline: React.FC = () => {
  const navigate = useNavigate();

  const [pipelineData, setPipelineData] = useState<CreatePipelineItem[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState("");
  const [newPipeline, setNewPipeline] = useState<{
    noOfMod: number;
    name: string;
    status: string;
  }>({
    name: "",
    status: "Active",
    noOfMod: 0,
  });
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");

  // Fetch pipelines from backend
  const fetchPipelines = async () => {
    try {
      const res = await axios.get(`/api/pipeline/`);
      setPipelineData(res.data);
    } catch (error) {
      console.error("Error fetching pipelines:", error);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleViewClick = (id: string) => {
    navigate(`/pipeline/${id}`);
  };

  const handleCreateClick = () => {
    setShowForm(true);
  };

  // const handleChange = (
  //   e: React.ChangeEvent<
  //     HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  //   >
  // ) => {
  //   const { name, value } = e.target;
  //   setNewPipeline((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    const regex = /^[A-Za-z\s]*$/; // alphabets + spaces only

    if (!regex.test(value)) {
      setError("Special characters and numbers are not allowed.");
      return;
    }

    if (value.length > 30) {
      setError("Cannot exceed 30 characters.");
      return;
    }

    // ✅ valid input
    setError("");
    setCharCount(value.length);
    setNewPipeline((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!newPipeline.name.trim()) {
      toast.error("Please Enter Pipeline name"); // show toast here
      return;
    }

    try {
      const res = await axios.post(`/api/pipeline`, {
        name: newPipeline.name,
        // status: newPipeline.status,
      });

      setPipelineData((prev) => [...prev, res.data]);
      setNewPipeline({ name: "", status: "Active", noOfMod: 0 });
      setShowForm(false);
      toast.success("Pipeline created successfully ");
    } catch (error) {
      console.error("Error creating pipeline:", error);
      toast.error("Something went wrong while creating pipeline");
    }
  };

  const handleEditClick = (item: CreatePipelineItem) => {
    setEditRowId(item._id);
    setEditedName(item.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editedName || editedName.trim() === "") {
      toast.error("Please enter the pipeline name");
      return;
    }
    try {
      const res = await axios.patch(`/api/pipeline/${id}`, {
        name: editedName,
      });
      setPipelineData((prev) =>
        prev.map((item) => (item._id === id ? res.data : item))
      );
      setEditRowId(null);
    } catch (error) {
      console.error("Error updating pipeline:", error);
    }
  };

  return (
    <>
      <TopBar />
      <MainNav />
      <div className="d-flex">
        <MasterNav />
        <div className="master-pipeline-container p-3 w-100">
          <div className="col-12 field">
            <div className="d-flex justify-content-between align-items-center w-100">
              <h5 className="p-2 fw-bold mb-0 d-flex align-items-center">
                <FaChevronRight className="me-2" />
                Choose the Pipeline
              </h5>
              <button
                className="btn btn-primary mb-4"
                onClick={handleCreateClick}
              >
                Create New Pipeline
              </button>
            </div>
          </div>

          {showForm && (
            <div className="border p-3 rounded mb-4 shadow-sm bg-white">
              <h6 className="mb-3 fw-bold">Create Pipeline</h6>
              <div className="d-flex flex-wrap gap-3 align-items-start">
                {/* 🟢 Wrap textbox + count + error vertically */}
                <div className="d-flex flex-column">
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Pipeline Name"
                    value={newPipeline.name}
                    isInvalid={!!error}
                    onChange={handleChange}
                    style={{
                      width: "300px",
                      height: "45px",
                      // borderColor: error ? "red" : "#ced4da",
                    }}
                  />
                  <div className="d-flex justify-content-between">
                    <small
                      className="text-muted"
                      style={{
                        color: "#6c757d", // custom grey (Bootstrap muted grey)
                        fontSize: "0.75rem",
                        marginTop: "4px", // smaller font (12px approx)
                      }}
                    >
                      {charCount}/30 characters used
                    </small>
                  </div>
                  {error && (
                    <small style={{ color: "red", marginTop: "4px" }}>
                      {error}
                    </small>
                  )}
                </div>

                {/* Status Dropdown (optional – uncomment if needed) */}
                {/*
      <Form.Select
        name="status"
        value={newPipeline.status}
        onChange={handleChange}
        style={{ width: "200px", height: "45px" }}
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </Form.Select>
      */}

                {/* Save Button */}
                <Button variant="primary" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          )}

          <div className="table-responsive">
            <Table hover className="pipeline-table align-middle text-center">
              <thead className="table-header">
                <tr className="table-header-row">
                  <th>S.No</th>
                  <th>Pipeline Name</th>
                  <th>No.of Modules</th>
                  <th>Created On</th>
                  <th>Created by</th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pipelineData.length > 0 ? (
                  pipelineData.map((item: CreatePipelineItem, idx: number) => (
                    <tr key={item._id}>
                      <td>{idx + 1}</td>

                      {/* Editable Pipeline Name */}
                      <td>
                        {editRowId === item._id ? (
                          <Form.Control
                            type="text"
                            value={editedName ?? ""}
                            onChange={(e) => setEditedName(e.target.value)}
                            style={{ width: "200px" }}
                          />
                        ) : (
                          item.name
                        )}
                      </td>

                      {/* Non-editable Modules */}
                      <td>{item.noOfMod}</td>

                      <td>
                        {item.createdon
                          ? new Date(item.createdon).toLocaleDateString("en-GB")
                          : "-"}
                      </td>

                      <td>{item.createdby || "Admin"}</td>

                      {/* Actions */}
                      <td className="d-flex justify-content-center gap-2">
                        {editRowId === item._id ? (
                          <Button
                            variant="link"
                            className="view-btn p-0"
                            onClick={() => handleSaveEdit(item._id)}
                          >
                            ✅
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            className=" p-0"
                            onClick={() => handleEditClick(item)}
                          >
                            <FaEdit size={16} />
                          </Button>
                        )}

                        <Button
                          variant="link"
                          className="view-btn p-0"
                          onClick={() => handleViewClick(item._id)}
                        >
                          <span className="arrow-icon-circle">
                            <FaArrowRight size={10} />
                          </span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      No record found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

export default MasterPipeline;
