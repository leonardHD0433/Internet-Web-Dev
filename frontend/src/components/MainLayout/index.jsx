import { Outlet } from 'react-router-dom';
import './styles.css';
import SidePanel from '../SidePanel';

const MainLayout = ({ connectionStatus, handleStatusClick }) => (
  <div className="main-layout">
    <SidePanel connectionStatus={connectionStatus} handleStatusClick={handleStatusClick} /> {/* Pass props to SidePanel */}
    <div className="main-content">
      <Outlet />
    </div>
  </div>
);

export default MainLayout;