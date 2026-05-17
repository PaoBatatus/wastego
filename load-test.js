import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'http://localhost:8000/api/v1';

export default function () {
  const res = http.get(`${BASE_URL}/residuos`, {
    headers: { Accept: 'application/json' },
  });

  check(res, {
    'status é 200': (r) => r.status === 200,
    'resposta tem data': (r) => r.json('success') === true,
  });

  sleep(1);
}