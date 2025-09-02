import { useEffect, useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../Common/Topbar";
import MainNav from "../Common/MainNav";
import "./ModuleView.css";
import MasterNav from "./MasterNav";
import { FaChevronRight, FaEdit } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

interface ModuleData {
  _id: string;
  name: string;
  dropdowns: number;
  createdon: string;
  createdBy?: string;
  updatedAt?: string;
  // status: string;
  noOfdropdown: number;
}

const ModuleView = () => {
  const { pipelineId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [pipelineData, setPipelineData] = useState<
    { _id: string; name: string; noOfdropdown: string }[]
  >([]);
  const [ModuleCharCount, setModuleCharCount] = useState(0);
  const [ModuleError, setModuleError] = useState("");

  const [newModule, setNewModule] = useState({
    pipeline: "",
    name: "",
    // status: "Active",
    noOfdropdown: 0,
  });

  useEffect(() => {
    const fetchAllModules = async () => {
      try {
        const res = await axios.get(`/api/module/pipeline/${pipelineId}`);
        const modulesWithDropdowns = await Promise.all(
          res.data.map(async (mod: ModuleData) => {
            const dropdownRes = await axios.get(
              `/api/dropdown/module/${mod._id}`
            );
            return {
              ...mod,
              noOfdropdown: dropdownRes.data.length,
            };
          })
        );
        setModules(modulesWithDropdowns);
      } catch (err) {
        console.error("Error fetching modules or dropdowns:", err);
      }
    };

    fetchAllModules();
  }, [pipelineId]);

  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        const res = await axios.get("/api/pipeline");
        setPipelineData(
          res.data.map((p: any) => ({
            ...p,
            _id: p._id.toString(),
          }))
        );
      } catch (err) {
        console.error("Error fetching pipelines:", err);
      }
    };
    fetchPipelines();
  }, []);

  const handleViewClick = (moduleId: string) => {
    navigate(`/pipeline/${pipelineId}/module/${moduleId}`);
  };

  const handleEditClick = (module: ModuleData) => {
    setEditRowId(module._id.toString());
    setEditedName(module.name);
  };

  const handleSaveEdit = async (id: string | number) => {
    try {
      await axios.patch(`/api/module/${id}`, { name: editedName });
      setModules((prev) =>
        prev.map((m) => (m._id === id ? { ...m, name: editedName } : m))
      );
      setEditRowId(null);
      setEditedName("");
    } catch (err) {
      console.error("Error updating module:", err);
      toast.error("Failed to update module name");
    }
  };

  const handleModuleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    const regex = /^[A-Za-z\s]*$/; // alphabets + spaces only

    if (!regex.test(value)) {
      setModuleError("Special characters and numbers are not allowed.");
      return;
    }

    if (value.length > 30) {
      setModuleError("Cannot exceed 30 characters.");
      return;
    }

    // ✅ valid input
    setModuleError("");
    setModuleCharCount(value.length);
    setNewModule((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveModule = async () => {
    if (!newModule.name) {
      toast.error("Please Enter Module name"); // validation-ku leave panirunga
      return;
    }

    try {
      // Send POST request to backend
      const res = await axios.post(`/api/module/${pipelineId}`, {
        name: newModule.name,
        // status: newModule.status,
        dropdowns: newModule.noOfdropdown,
        createdBy: "Admin",
      });

      // Add the newly created module to local state
      setModules((prev) => [...prev, res.data]);

      // Reset form & close it
      setShowForm(false);
      setNewModule({
        pipeline: "",
        name: "",
        // status: "Active",
        noOfdropdown: 0,
      });
      toast.success("Module created Successully");

      // ✅ Removed success alert
    } catch (err) {
      console.error("Error creating module:", err);
      // alert("Failed to create module");
    }
  };

  return (
    <>
      <TopBar />
      <MainNav />
      <div className="layout-wrapper d-flex flex-nowrap">
        <MasterNav />
        <div className="content-wrapper p-3 w-100">
          <div className="col-12 field">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="p-2 fw-bold mb-0 d-flex align-items-center">
                <FaChevronRight className="me-2" />
                Choose the Module
              </h5>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(!showForm)}
                >
                  Create New Module
                </button>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  ← Back
                </Button>
              </div>
            </div>

            {showForm && (
              <div className="border p-3 rounded mb-4 shadow-sm bg-white">
                <h6 className="mb-3 fw-bold">Create Module</h6>
                <div className="d-flex flex-wrap gap-3 align-items-start">
                  {/* 🟢 Wrap textbox + count + error vertically */}
                  <div className="d-flex flex-column">
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Module Name"
                      value={newModule.name}
                      isInvalid={!!ModuleError}
                      onChange={handleModuleChange}
                      style={{
                        width: "300px",
                        height: "45px",
                        // borderColor: ModuleError ? "red" : "#ced4da",
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
                        {ModuleCharCount}/30 characters used
                      </small>
                    </div>
                    {ModuleError && (
                      <small style={{ color: "red", marginTop: "4px" }}>
                        {ModuleError}
                      </small>
                    )}
                  </div>

                  {/* Status Dropdown (optional – uncomment if you need) */}
                  {/* 
      <Form.Select
        name="status"
        value={newModule.status}
        onChange={(e) =>
          setNewModule({ ...newModule, status: e.target.value })
        }
        style={{ width: "200px", height: "45px" }}
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </Form.Select>
      */}

                  {/* Save Button */}
                  <Button variant="primary" onClick={handleSaveModule}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="table-responsive">
            <Table hover className="module-view align-middle">
              <thead className="text-white" style={{ backgroundColor: "blue" }}>
                <tr className="table-header-row text-center">
                  <th style={{ width: "60px" }}>S.No</th>
                  <th style={{ textAlign: "center" }}>Module Name</th>
                  <th>Dropdowns</th>
                  <th>Created On</th>
                  <th>Created By</th>
                  <th style={{ textAlign: "left", paddingLeft: "10px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {modules.length > 0 ? (
                  modules.map((mod, idx) => (
                    <tr key={mod._id} className="text-center">
                      <td>{idx + 1}</td>
                      <td>
                        {editRowId === mod._id ? (
                          <input
                            type="text"
                            className="form-control text-center"
                            style={{ width: "200px" }}
                            value={editedName ?? ""}
                            onChange={(e) => setEditedName(e.target.value)}
                          />
                        ) : (
                          mod.name
                        )}
                      </td>
                      <td>{mod.noOfdropdown}</td>
                      <td>
                        {mod.createdon
                          ? new Date(mod.createdon).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td>{mod.createdBy || "Admin"}</td>
                      <td className="d-flex gap-2 me-2">
                        {editRowId === mod._id ? (
                          <Button
                            variant="link"
                            className="p-0 "
                            onClick={() => handleSaveEdit(mod._id)}
                          >
                            ✅
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => handleEditClick(mod)}
                          >
                            <FaEdit size={16} />
                          </Button>
                        )}
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() => handleViewClick(mod._id)}
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

export default ModuleView;
