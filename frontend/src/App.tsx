import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import koKR from 'antd/locale/ko_KR';
import AppRoutes from './routes/AppRoutes';
import './App.less';
import './custom.css';
import RealGrid from "realgrid";
import 'realgrid/dist/realgrid-style.css';

RealGrid.setLicenseKey("upVcPE+wPOmtLjqyBIh9RkM/nBOseBrflwxYpzGZyYm9cY8amGDkiHqyYT2U1Yh3Dufv8SUhNy6T2r5WyZvYg2tFjXof5zyFtzZlBHBzRBJn/bTgBA+74pDPop0Q97Ap/WC8QoVsCZI=");

function App() {
  return (
    <ConfigProvider
      locale={koKR}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <Router>
        <AppRoutes />
      </Router>
    </ConfigProvider>
  );
}

export default App;
