import './styles.css'

const LoginForm = ({ onSubmit }) => (
  <div className="login-form">
    <input 
      type="text"
      placeholder="Username"
      className="login-input"
    />
    <input 
      type="password"
      placeholder="Password"
      className="login-input"
    />
    <button className="login-button" onClick={onSubmit}>
      Login
    </button>
  </div>
)

export default LoginForm