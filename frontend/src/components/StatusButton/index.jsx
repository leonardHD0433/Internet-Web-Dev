import './styles.css'

const StatusButton = ({ status, onClick }) => (
  <button className="status-button" onClick={onClick}>
    Status <span className={`status-indicator ${status}`} />
  </button>
)

export default StatusButton