import './styles.css'

const CloseButton = ({ onClick }) => (
  <button className="close-button" onClick={onClick}>
    ✕
  </button>
)

export default CloseButton