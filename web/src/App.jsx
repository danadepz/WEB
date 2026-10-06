import { HashRouter as Router } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
import { ToastProvider } from './components/ui/Toast';
import EsportsLayout from './components/EsportsLayout';

function App() {
  return (
    <FirebaseAuthProvider>
      <TournamentProvider>
        <ToastProvider>
          <Router>
            <EsportsLayout />
          </Router>
        </ToastProvider>
      </TournamentProvider>
    </FirebaseAuthProvider>
  );
}

export default App;
