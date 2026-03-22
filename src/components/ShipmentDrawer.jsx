import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./ShipmentDrawer.module.css"; 

const formatDateTime = (raw) => {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d)) return String(raw);
    return d.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(raw);
  }
};

const ShipmentDrawer = ({ awb, open, onClose, timeline = [], loading = false, error = null, meta = null }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay || ""} role="dialog" aria-modal="true" style={{position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end'}}>
      <div className={styles.drawer || ""} style={{width: 420, maxWidth: '100%', background: '#fff', height: '100%', padding: 20, overflowY: 'auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div>
            <h3 style={{margin:0}}>{meta?.title || "Shipment Tracking"}</h3>
            <small>{awb ? `AWB: ${awb}` : ""}</small>
          </div>
          <button onClick={onClose} aria-label="Close" style={{padding:'6px 10px'}}>✖</button>
        </div>

        {loading && <p>Loading tracking...</p>}
        {error && <p style={{color:'red'}}>Error: {error}</p>}

        {!loading && !error && (!timeline || timeline.length === 0) && <p>No tracking events found yet.</p>}

        <ul style={{listStyle:'none', padding:0, margin:0}}>
          {timeline.map((ev, i) => (
            <li key={i} style={{padding:'10px 0', borderBottom:'1px solid #eee'}}>
              <div style={{fontWeight:600}}>{ev.title || ev.status || 'Update'}</div>
              { (ev.detail || ev.description) && <div style={{color:'#666', marginTop:6}}>{ev.detail || ev.description}</div> }
              <div style={{fontSize:12, color:'#888', marginTop:6}}>{formatDateTime(ev.time || ev.date || ev.datetime || ev.created_at)}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

ShipmentDrawer.propTypes = {
  awb: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  timeline: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  meta: PropTypes.object,
};

ShipmentDrawer.defaultProps = {
  awb: "",
  open: false,
  timeline: [],
  loading: false,
  error: null,
  meta: null,
};

export default ShipmentDrawer;
