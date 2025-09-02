import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../Common/Topbar";
import MainNav from "../Common/MainNav";
import MasterNav from "./MasterNav";
import { FaChevronRight, FaEye, FaEdit } from "react-icons/fa";
import OptionView from "./OptionView";
import axios from "axios";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";

interface DropdownData {
  _id: string;
  name: string;
  options: number;
  createdon: string;
  createdby: string;
  status: string;
  updatedAt?: string;
}

const DropdownView = () => {
  const { moduleId, pipelineId } = useParams();
  const [dropdowns, setDropdowns] = useState<DropdownData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDropdownId, setSelectedDropdownId] = useState<string | null>(
    null
  );
  const [selectedDropdownName, setSelectedDropdownName] = useState<string>("");
  const [editDropdown, setEditDropdown] = useState<DropdownData | null>(null);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDropdownForm, setShowDropdownForm] = useState(false);
  const [dropdownError, setDropdownError] = useState("");
  const [dropdownCharCount, setDropdownCharCount] = useState(0);

  const [newDropdown, setNewDropdown] = useState({
    name: "",
    status: "Active",
  });
  const handleEditClick = (dropdown: DropdownData) => {
    setEditDropdown(dropdown);
    setShowEditForm(true);
  };

  const navigate = useNavigate();

  const fetchDropdowns = async () => {
    try {
      const res = await axios.get(`/api/dropdown/module/${moduleId}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setDropdowns(data);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  useEffect(() => {
    if (moduleId) {
      fetchDropdowns();
    }
  }, [moduleId]);

  const handleSaveEdit = async (drop: { _id: string }) => {
    if (!editDropdown) return; // prevent null issue

    try {
      await axios.patch(`/api/dropdown/${drop._id}`, {
        name: editDropdown.name,
        status: editDropdown.status,
      });

      // update state
      setDropdowns((prev) =>
        prev.map((d) =>
          d._id === drop._id
            ? {
                ...d,
                name: editDropdown.name,
                status: editDropdown.status,
              }
            : d
        )
      );

      setEditDropdown(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleSaveDropdown = async () => {
    if (!newDropdown.name) {
      toast.error("Please Enter Dropdown name");
      return;
    }

    try {
      const res = await axios.post(`/api/dropdown/${moduleId}`, {
        name: newDropdown.name,
        status: newDropdown.status,
        createdby: "Admin",
      });

      setDropdowns((prev) => [...prev, res.data]);

      // reset form
      setNewDropdown({ name: "", status: "Active" });
      setShowDropdownForm(false);
      toast.success("Dropdown created Successfully");
    } catch (err) {
      console.error("Error creating dropdown:", err);
      alert("Failed to create dropdown");
    }
  };

  const handleViewClick = (dropdownId: string, dropdownName: string) => {
    setSelectedDropdownId(dropdownId);
    setSelectedDropdownName(dropdownName);
    setShowModal(true);
  };

  const handleDropdownChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    const regex = /^[A-Za-z\s]*$/; // only alphabets + space

    if (!regex.test(value)) {
      setDropdownError("Special characters and numbers are not allowed.");
      return;
    }

    if (value.length > 30) {
      setDropdownError("Cannot exceed 30 characters.");
      return;
    }

    // ✅ valid
    setDropdownError("");
    setDropdownCharCount(value.length);
    setNewDropdown((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <TopBar />
      <MainNav />
      <div className="layout-wrapper d-flex flex-nowrap">
        <MasterNav />
        <div className="p-3 w-100">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="fw-bold m-0">
              <FaChevronRight className="me-2" />
              Choose the Dropdown
            </h5>

            <div>
              <Button
                className="btn btn-primary me-2"
                onClick={() => setShowDropdownForm(!showDropdownForm)}
              >
                Create new Dropdown
              </Button>

              <Button variant="secondary" onClick={() => navigate(-1)}>
                ← Back
              </Button>
            </div>
          </div>

          {/* ✅ Create Dropdown Form (toggle visible) */}
          {showDropdownForm && (
            <div className="border p-3 rounded mb-4 shadow-sm bg-white">
              <h6 className="mb-3 fw-bold">Create Dropdown</h6>
              <div className="d-flex flex-wrap gap-3 align-items-start">
                {/* 🟢 Wrap textbox + error vertically */}
                <div className="d-flex flex-column">
                  <Form.Control
                    name="name"
                    type="text"
                    placeholder="Dropdown Name"
                    value={newDropdown.name || ""}
                    isInvalid={!!dropdownError}
                    onChange={handleDropdownChange}
                    style={{
                      width: "300px",
                      height: "45px",
                      // borderColor: dropdownError ? "red" : "#ced4da",
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
                      {dropdownCharCount}/30 characters used
                    </small>
                  </div>
                  {dropdownError && (
                    <small style={{ color: "red", marginTop: "4px" }}>
                      {dropdownError}
                    </small>
                  )}
                </div>

                {/* Status Select */}
                <Form.Select
                  value={newDropdown.status}
                  onChange={(e) =>
                    setNewDropdown({ ...newDropdown, status: e.target.value })
                  }
                  style={{ width: "200px", height: "45px" }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>

                {/* Save button */}
                <Button variant="primary" onClick={handleSaveDropdown}>
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* ✅ Dropdowns Table */}
          <div className="table-wrapper">
            <Table hover className="dropdown-view align-middle">
              <thead>
                <tr className="table-header-row text-center">
                  <th style={{ width: "60px" }}>S.No</th>
                  <th style={{ textAlign: "center" }}>Dropdown Name</th>
                  <th>Created On</th>
                  <th>Created By</th>
                  <th>Status</th>
                  <th style={{ textAlign: "left", paddingLeft: "10px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {dropdowns.length > 0 ? (
                  dropdowns.map((drop, idx) => (
                    <tr key={`${drop._id}-${idx}`} className="text-center">
                      {/* S.No */}
                      <td>{idx + 1}</td>

                      {/* Dropdown Name */}
                      <td style={{ textAlign: "center" }}>
                        {editDropdown?._id === drop._id ? (
                          <Form.Control
                            type="text"
                            value={editDropdown.name}
                            onChange={(e) =>
                              setEditDropdown({
                                ...editDropdown,
                                name: e.target.value,
                              })
                            }
                            style={{ width: "200px" }}
                          />
                        ) : (
                          drop.name
                        )}
                      </td>

                      {/* Created On */}
                      <td>
                        {drop.createdon
                          ? new Date(drop.createdon).toLocaleDateString("en-GB")
                          : "-"}
                      </td>

                      {/* Created By */}
                      <td>{drop.createdby}</td>

                      {/* Status */}
                      <td>
                        {editDropdown?._id === drop._id ? (
                          <Form.Select
                            size="sm"
                            value={editDropdown.status}
                            onChange={(e) =>
                              setEditDropdown((prev) =>
                                prev
                                  ? { ...prev, status: e.target.value }
                                  : prev
                              )
                            }
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </Form.Select>
                        ) : (
                          <span className="status-badge">{drop.status}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="d-flex gap-2 me-2">
                        {editDropdown?._id === drop._id ? (
                          <Button
                            variant="link"
                            className="p-0 text-success"
                            onClick={() => handleSaveEdit(drop)}
                          >
                            ✅
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => handleEditClick(drop)}
                          >
                            <FaEdit size={16} />
                          </Button>
                        )}

                        <Button
                          variant="link"
                          className="p-0"
                          style={{ color: "black" }}
                          onClick={() => handleViewClick(drop._id, drop.name)}
                        >
                          <FaEye size={16} />
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

      {/* ✅ Modal Popup for OptionView */}
      {showModal && selectedDropdownId && (
        <OptionView
          dropdownId={selectedDropdownId}
          dropdownName={selectedDropdownName}
          moduleId={moduleId!}
          pipelineId={pipelineId!}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default DropdownView;
