import { useState, useMemo, useEffect, useCallback } from 'react';
import StatCards from '../components/Dashboard/StatCards';
import MapView from '../components/Map/MapView';
import LiveFeed from '../components/LiveFeed/LiveFeed';
import PotholeDetail from '../components/LiveFeed/PotholeDetail';
import ReportsTable from '../components/Reports/ReportsTable';
import { subscribeToRoadReports } from '../services/roadReportService';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState(null); // reports at a clicked point/cluster

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToRoadReports((data) => {
      if (isMounted) {
        setReports(data);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const statistics = useMemo(() => {
    let poor = 0;
    let moderate = 0;
    let good = 0;
    const devices = new Set();

    reports.forEach((report) => {
      if (report.condition === 'Poor') poor++;
      else if (report.condition === 'Moderate') moderate++;
      else if (report.condition === 'Good') good++;

      devices.add(report.deviceId);
    });

    return {
      totalReports: reports.length,
      poorRoads: poor,
      moderateRoads: moderate,
      goodRoads: good,
      activeDevices: devices.size,
      changes: {
        totalReports: 0,
        poorRoads: 0,
        moderateRoads: 0,
        goodRoads: 0,
        activeDevices: 0,
      },
    };
  }, [reports]);

  const handlePointSelect = useCallback((pointReports) => {
    setSelectedReports(pointReports);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedReports(null);
  }, []);

  return (
    <>
      <section>
        <StatCards statistics={statistics} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-10 gap-6 min-h-[480px] lg:min-h-[520px]">
        <div className="lg:col-span-7 h-[400px] lg:h-full min-h-0">
          <MapView reports={reports} onPointSelect={handlePointSelect} />
        </div>
        <div className="lg:col-span-3 h-[400px] lg:h-full min-h-0">
          {selectedReports ? (
            <PotholeDetail reports={selectedReports} onClose={handleCloseDetail} />
          ) : (
            <LiveFeed feedData={reports} />
          )}
        </div>
      </section>

      <section>
        <ReportsTable reports={reports} />
      </section>
    </>
  );
}
