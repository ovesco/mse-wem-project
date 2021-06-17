import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from "react-router-dom";
import Stores from './views/Stores';
import Store from './views/Store';
import Authors from './views/Authors';
import SearchBar from './components/SearchBar';

function App() {

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="container mx-auto mt-10 flex justify-between items-center">
        <div className="flex">
          <NavLink exact activeClassName="bg-gray-100" className="rounded py-3 px-4" to="/">Stores</NavLink>
          <NavLink activeClassName="bg-gray-100" className="rounded py-3 px-4" to="/authors">Authors</NavLink>
        </div>
        <SearchBar />
      </div>
      <Switch>
        <Route exact path="/">
          <Stores />
        </Route>
        <Route path="/store/:storeid">
          <Store />
        </Route>
        <Route path="/authors">
          <Authors />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
