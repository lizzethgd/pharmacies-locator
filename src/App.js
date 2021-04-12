import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './App.css';

import Home from './Home';

const App = () => {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
        </Switch>
      </BrowserRouter>
    )
  }
  
  export default App;
