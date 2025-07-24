import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import koKR from 'antd/locale/ko_KR';
import AppRoutes from './routes/AppRoutes';
import './App.less';
import './custom.css';
import {AllCommunityModule, ModuleRegistry} from "ag-grid-community";
import { AllEnterpriseModule, LicenseManager, IntegratedChartsModule } from "ag-grid-enterprise";
import { TreeDataModule, ContextMenuModule } from 'ag-grid-enterprise';

LicenseManager.setLicenseKey("[TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-090575}_is_granted_for_evaluation_only___Use_in_production_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_purchasing_a_production_key_please_contact_info@ag-grid.com___You_are_granted_a_{Single_Application}_Developer_License_for_one_application_only___All_Front-End_JavaScript_developers_working_on_the_application_would_need_to_be_licensed___This_key_will_deactivate_on_{14 August 2025}____[v3]_[0102]_MTc1NTEyNjAwMDAwMA==2bf724e243e12a2673a0da27840ab6db");

ModuleRegistry.registerModules([ AllCommunityModule ]);
ModuleRegistry.registerModules([ TreeDataModule, ContextMenuModule, AllEnterpriseModule, IntegratedChartsModule ]);

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
