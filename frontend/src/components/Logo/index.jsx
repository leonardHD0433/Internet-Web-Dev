import './styles.css'
import logo from '../../assets/CinerateLogo.png'

const Logo = () => (
  <div className="logo-placeholder">
    <div className="logo-frame">
      <img 
        src={logo}
        alt="CINERATE Logo"
        className="logo-image" 
      />
    </div>
  </div>
)

export default Logo