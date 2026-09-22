import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    'http_req_duration{name:cart}': ['p(95)<15'],    // Custom Performance SLO (Localhost хурдыг тусгасан: <15ms)
    'http_req_duration{name:report}': ['p(95)<400'], // Custom Report SLO (<400ms)
    'http_req_failed{name:pay}':    ['rate<0.08'],   // Reliability SLO (<8% алдаа)
    'checks':                       ['rate>0.90'],   // Availability SLO (≥90% амжилт)
  },
};

export default function () {
  const base = 'http://localhost:3000';
  const c = http.post(`${base}/cart/add`, null, { tags: { name: 'cart' } });
  const r = http.get(`${base}/report`,        { tags: { name: 'report' } });
  const p = http.post(`${base}/pay`, null,      { tags: { name: 'pay' } });
  check(c, { 'cart 200': (x) => x.status === 200 });
  check(r, { 'report 200': (x) => x.status === 200 });
  check(p, { 'pay 200': (x) => x.status === 200 });
  sleep(1);
}
