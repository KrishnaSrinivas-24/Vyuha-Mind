import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

os.environ['ENABLE_ADK_AGENTS'] = 'false'
os.environ['GROK_API_KEY'] = ''

from app.main import app
from app.orchestrator import run_simulation


class DiagnosticsFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def _crisis_payload(self):
        return {
            'input': {
                'product_name': 'FuelShield',
                'product_description': 'Fuel optimization and dispatch software during LPG supply disruptions',
                'features': ['Fuel Analytics', 'Automated Dispatch', 'Demand Forecasting'],
                'price': 1499,
                'pricing_strategy': 'Penetration',
                'target_audience': 'Urban Delivery',
                'market_scenario': 'Iran-US war causing LPG shortage in India',
                'region': 'India',
            },
            'num_steps': 4,
        }

    def test_diagnostics_contains_per_step_modes(self):
        response = self.client.post('/diagnostics/simulate', json=self._crisis_payload())
        self.assertEqual(response.status_code, 200)

        body = response.json()
        self.assertIn('diagnostics', body)
        self.assertIn('evaluation', body)

        diagnostics = body['diagnostics']
        self.assertIn('market_execution_mode', diagnostics)
        self.assertIn('step_agent_modes', diagnostics)
        self.assertGreaterEqual(len(diagnostics['step_agent_modes']), 1)

        first = diagnostics['step_agent_modes'][0]
        self.assertIn('customer', first)
        self.assertIn('competitor', first)
        self.assertIn('investor', first)
        self.assertIn('execution_mode', first['customer'])

    def test_simulate_status_is_plain_ascii_label(self):
        response = self.client.post('/simulate', json=self._crisis_payload())
        self.assertEqual(response.status_code, 200)

        status = response.json().get('evaluation', {}).get('status', '')
        allowed = {'HIGH_POTENTIAL', 'MODERATE_POTENTIAL', 'RISKY', 'NOT_RECOMMENDED'}
        self.assertIn(status, allowed)

    @patch('app.orchestrator.investor_agent')
    @patch('app.orchestrator.competitor_agent')
    @patch('app.orchestrator.customer_agent')
    @patch('app.orchestrator.market_analysis_agent')
    def test_convergence_stops_simulation_early(self, market_mock, customer_mock, competitor_mock, investor_mock):
        market_mock.return_value = {
            'fuel_price_index': 0.5,
            'supply_disruption': 0.5,
            'demand_shift': 0.5,
            'market_volatility': 0.5,
            'price_sensitivity': 0.6,
            'market_pressure': 0.5,
            'consumer_stress': 0.5,
            'summary': 'Stable conditions',
            'key_events': ['No major changes'],
            'sources_used': ['test'],
            'execution_mode': 'mock',
        }
        customer_mock.return_value = {
            'demand': 0.5,
            'sentiment': 'neutral',
            'reasoning': 'Demand remains flat.',
            'execution_mode': 'mock',
        }
        competitor_mock.return_value = {
            'strategy': 'monitoring',
            'competition': 0.35,
            'raw_price': 1499,
            'price_index': 0.1499,
            'competitor_action': 'none',
            'competitor_reasoning': 'No move.',
            'execution_mode': 'mock',
        }
        investor_mock.return_value = {
            'confidence': 0.5,
            'risk': 0.3,
            'verdict': 'hold',
            'risk_flags': [],
            'reasoning': 'No new risk.',
            'execution_mode': 'mock',
        }

        config = {
            'product': {
                'raw_price': 1499,
                'price_index': 0.1499,
                'feature_score': 0.6,
            },
            'audience': {
                'price_sensitivity': 0.6,
            },
        }

        result = run_simulation(config, num_steps=10)

        self.assertEqual(len(result['history']), 2)
        self.assertTrue(result['diagnostics']['convergence_triggered'])
        self.assertEqual(result['diagnostics']['convergence_step'], 2)
        self.assertIn('convergence_early_stop:step_2', result['warnings'])


if __name__ == '__main__':
    unittest.main()
