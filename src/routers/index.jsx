import {Test, Home, Instock} from '@/pages';
import {Routes, Route, Outlet, Link, BrowserRouter} from 'react-router-dom';
import {InstockHistory} from '../pages';

export default () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/metage" element={<Test />} />
        <Route index path="/instock" element={<Instock />} />
        <Route index path="/instockHistory" element={<InstockHistory />} />
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
};
