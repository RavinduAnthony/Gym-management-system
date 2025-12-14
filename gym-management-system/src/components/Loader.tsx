import spartaLogo from '../assets/sparta-logo.jpg';
import '../styles/Loader.css';

export default function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <img 
          src={spartaLogo} 
          alt="Loading" 
          className="loader-logo"
        />
      </div>
    </div>
  );
}
