import React from "react";
import { FaIndustry } from "react-icons/fa";

interface FabricantData {
  nom: string;
  type: string;
  email: string;
  telephone: string;
  siteweb?: string;
  statut: string;
}

interface CreateFabricantModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: () => void;
  newFabricant: FabricantData;
  setNewFabricant: React.Dispatch<React.SetStateAction<FabricantData>>;
}

const CreateFabricantModal: React.FC<CreateFabricantModalProps> = ({
  show,
  onClose,
  onCreate,
  newFabricant,
  setNewFabricant,
}) => {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.35)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "0",
          borderRadius: "18px",
          minWidth: "340px",
          maxWidth: "95vw",
          width: "400px",
          boxShadow: "0 8px 32px rgba(30,176,91,0.15)",
          overflow: "hidden",
        }}
      >
        <div style={{
          background: "linear-gradient(90deg,#1FB05B 70%,#1fb07b 100%)",
          color: "#fff",
          padding: "18px 24px 12px 24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <FaIndustry size={28} style={{marginRight:8}} />
          <span style={{fontWeight:600, fontSize:"1.2rem"}}>Créer un nouveau fabricant</span>
        </div>
        <form style={{padding: "22px 24px 10px 24px"}}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{fontWeight:500, marginBottom:4, display:"block"}}>Nom du fabricant *</label>
            <input
              type="text"
              className="form-control"
              style={{borderRadius:8, border:"1px solid #1FB05B", padding:"8px"}}
              value={newFabricant.nom}
              onChange={e => setNewFabricant({ ...newFabricant, nom: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{fontWeight:500, marginBottom:4, display:"block"}}>Type de fabricant *</label>
            <select
              className="form-control"
              style={{borderRadius:8, border:"1px solid #1FB05B", padding:"8px"}}
              value={newFabricant.type}
              onChange={e => setNewFabricant({ ...newFabricant, type: e.target.value })}
            >
              <option value="Local">Local</option>
              <option value="Étranger">Étranger</option>
            </select>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{fontWeight:500, marginBottom:4, display:"block"}}>Email</label>
            <input
              type="email"
              className="form-control"
              style={{borderRadius:8, border:"1px solid #1FB05B", padding:"8px"}}
              value={newFabricant.email}
              onChange={e => setNewFabricant({ ...newFabricant, email: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{fontWeight:500, marginBottom:4, display:"block"}}>Téléphone</label>
            <input
              type="tel"
              className="form-control"
              style={{borderRadius:8, border:"1px solid #1FB05B", padding:"8px"}}
              value={newFabricant.telephone}
              onChange={e => setNewFabricant({ ...newFabricant, telephone: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{fontWeight:500, marginBottom:4, display:"block"}}>Site web (optionnel)</label>
            <input
              type="url"
              className="form-control"
              style={{borderRadius:8, border:"1px solid #1FB05B", padding:"8px"}}
              value={newFabricant.siteweb}
              onChange={e => setNewFabricant({ ...newFabricant, siteweb: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{fontWeight:500, marginBottom:4, display:"block"}}>Statut de préqualification</label>
            <select
              className="form-control"
              style={{borderRadius:8, border:"1px solid #1FB05B", padding:"8px"}}
              value={newFabricant.statut}
              onChange={e => setNewFabricant({ ...newFabricant, statut: e.target.value })}
            >
              <option value="OMS">OMS</option>
              <option value="FDA">FDA</option>
              <option value="Aucune">Aucune</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
            <button type="button" className="btn btn-secondary" style={{borderRadius:8, minWidth:90}} onClick={onClose}>
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-success"
              style={{borderRadius:8, minWidth:90, background:'#1FB05B', border:'none'}}
              onClick={onCreate}
              disabled={!newFabricant.nom}
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFabricantModal;
