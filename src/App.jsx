/** @format */

import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Splash from "./copmonents/Splash";
import Login from "./copmonents/Login";
import SignUp from "./copmonents/SignUp";
import EmailConfirmation from "./copmonents/EmailConfirmation";
import PendingApproval from "./copmonents/PendingApproval";
import PasswordConfirmation from "./copmonents/PasswordConfirmation";
import ForgotPassword from "./copmonents/ForgotPassword";
import Sign from "./copmonents/Sign";
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Splash />} />
        <Route path='/sign' element={<Sign />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/verify-email' element={<EmailConfirmation />} />
        <Route path='/pending-approval' element={<PendingApproval />} />
        <Route
          path='/password-confirmation'
          element={<PasswordConfirmation />}
        />
      </Routes>
    </Router>
  );
}

export default App;
