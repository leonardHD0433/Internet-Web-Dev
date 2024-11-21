import { useNavigate } from 'react-router-dom'
import './styles.css'

const CreateAccountButton = () => {
  const navigate = useNavigate()
  return (
    <div className="create-account-text">
      New here? <a onClick={() => navigate('/register')}>Create an account</a>
    </div>
  )
}

export default CreateAccountButton