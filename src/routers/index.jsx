import Home from '@/App';
import {Test} from '@/pages';
import {Routes, Route, Outlet, Link, BrowserRouter} from 'react-router-dom';

export default () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Layout />}> */}
        <Route index element={<Test />} />
        {/* <Route path="test" element={<Home />} /> */}
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
};
