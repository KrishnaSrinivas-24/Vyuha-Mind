import unittest
import os

os.environ['ENABLE_ADK_AGENTS'] = 'false'
os.environ['GROK_API_KEY'] = ''

from fastapi.testclient import TestClient

from app.main import app


class ApiContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_ok(self):
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('status'), 'ok')

    def test_simulate_returns_expected_contract(self):
        payload = {
            'input': {
                'product_name': 'FleetOptima Pro',
                'product_description': 'AI platform for route optimization and fleet tracking',
                'features': ['Route Optimization', 'Fleet Tracking', 'Predictive Maintenance'],
                'price': 1999,
                'pricing_strategy': 'Value-Based',
                'target_audience': 'SMB Logistics',
                'market_scenario': 'Stable Market',
                'region': 'India',
            },
            'num_steps': 3,
        }

        response = self.client.post('/simulate', json=payload)
        self.assertEqual(response.status_code, 200)

        body = response.json()
        for key in ['history', 'agent_logs', 'evaluation', 'recommendation', 'final_state', 'diagnostics']:
            self.assertIn(key, body)

        self.assertGreaterEqual(body.get('steps_run', 0), 1)
        self.assertIn('market_execution_mode', body['diagnostics'])

    def test_simulate_rejects_invalid_price(self):
        payload = {
            'input': {
                'product_name': 'Bad',
                'product_description': 'Bad',
                'features': ['x'],
                'price': -1,
                'pricing_strategy': 'x',
                'target_audience': 'x',
                'market_scenario': 'x',
                'region': 'India',
            },
            'num_steps': 3,
        }

        response = self.client.post('/simulate', json=payload)
        self.assertEqual(response.status_code, 422)

    def test_recommend_accepts_frontend_safe_payload(self):
        payload = {
            'config': {},
            'current_score': 55,
            'current_state': {
                'fuel_price_index': 0.6,
                'supply_disruption': 0.7,
                'demand_shift': 0.5,
                'market_volatility': 0.4,
                'price_sensitivity': 0.6,
                'market_pressure': 0.7,
                'consumer_stress': 0.65,
                'feature_score': 0.5,
            },
            'market_context': {'summary': 'test', 'key_events': ['x']},
            'num_steps': 4,
        }

        response = self.client.post('/recommend', json=payload)
        self.assertEqual(response.status_code, 200)

        body = response.json()
        for key in ['best_price', 'best_score', 'recommendation_type', 'comparison_table']:
            self.assertIn(key, body)


if __name__ == '__main__':
    unittest.main()
