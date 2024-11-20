import { useNavigate } from 'react-router-dom'
import './styles.css'

const CreateAccountButton = () => {
  const navigate = useNavigate()
  return (
    <button 
      className="create-account-button" 
      onClick={() => navigate('/register')}
    >
      Create Account
    </button>
  )
}

export default CreateAccountButton