"""
Component NMA — Selenium Test Suite
25 tests covering data input, analysis, network, results, and export.
Run: python test_component_nma.py
"""
import sys, os, time, io, unittest

if __name__ == "__main__" and hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

HTML_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'component-nma.html')
URL = 'file:///' + HTML_PATH.replace('\\', '/')


def get_driver():
    opts = Options()
    opts.add_argument('--headless=new')
    opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-gpu')
    opts.add_argument('--window-size=1400,900')
    opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    driver = webdriver.Chrome(options=opts)
    driver.implicitly_wait(2)
    return driver


class ComponentNMATests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = get_driver()
        cls.driver.get(URL)
        time.sleep(0.5)

    @classmethod
    def tearDownClass(cls):
        logs = cls.driver.get_log('browser')
        severe = [l for l in logs if l['level'] == 'SEVERE' and 'favicon' not in l.get('message', '')]
        if severe:
            print(f"\nJS ERRORS ({len(severe)}):")
            for l in severe:
                print(f"  {l['message']}")
        cls.driver.quit()

    def _reload(self):
        self.driver.get(URL)
        time.sleep(0.3)

    def _click(self, by, val):
        el = WebDriverWait(self.driver, 5).until(EC.presence_of_element_located((by, val)))
        self.driver.execute_script("arguments[0].click()", el)
        return el

    def _load_smoking(self):
        self._reload()
        self._click(By.ID, 'exSmoking')
        time.sleep(0.3)

    def _run_analysis(self):
        self._click(By.ID, 'runBtn')
        time.sleep(0.5)

    # ─── 1. PAGE LOAD ───
    def test_01_page_loads(self):
        self.assertIn('Component NMA', self.driver.title)

    def test_02_hero_visible(self):
        hero = self.driver.find_element(By.CSS_SELECTOR, '.hero-title')
        self.assertIn('Component NMA', hero.text)

    def test_03_four_tabs(self):
        tabs = self.driver.find_elements(By.CSS_SELECTOR, '.tab-btn')
        self.assertEqual(len(tabs), 4)

    def test_04_empty_state(self):
        self._reload()
        empty = self.driver.find_element(By.ID, 'emptyData')
        self.assertTrue(empty.is_displayed())

    def test_05_two_examples(self):
        btns = self.driver.find_elements(By.CSS_SELECTOR, '.example-btn')
        self.assertEqual(len(btns), 2)

    # ─── 2. LOAD SMOKING DATASET ───
    def test_06_load_smoking(self):
        self._load_smoking()
        count = self.driver.find_element(By.ID, 'compCount')
        self.assertIn('24', count.text)

    def test_07_smoking_table_rows(self):
        self._load_smoking()
        rows = self.driver.find_elements(By.CSS_SELECTOR, '#compTableBody tr')
        self.assertEqual(len(rows), 24)

    def test_08_component_tags_visible(self):
        self._load_smoking()
        tags = self.driver.find_elements(By.CSS_SELECTOR, '.component-tag')
        self.assertGreater(len(tags), 0)

    # ─── 3. LOAD DEPRESSION DATASET ───
    def test_09_load_depression(self):
        self._reload()
        self._click(By.ID, 'exDepression')
        time.sleep(0.3)
        count = self.driver.find_element(By.ID, 'compCount')
        self.assertIn('18', count.text)

    # ─── 4. MANUAL ENTRY ───
    def test_10_manual_add(self):
        self._reload()
        self.driver.find_element(By.ID, 'studyName').send_keys('Test 2024')
        self.driver.find_element(By.ID, 'treat1').send_keys('CBT+Exercise')
        self.driver.find_element(By.ID, 'treat2').send_keys('Placebo')
        self.driver.find_element(By.ID, 'effectInput').send_keys('-0.5')
        self.driver.find_element(By.ID, 'seInput').send_keys('0.15')
        self._click(By.ID, 'addCompBtn')
        time.sleep(0.2)
        rows = self.driver.find_elements(By.CSS_SELECTOR, '#compTableBody tr')
        self.assertEqual(len(rows), 1)

    # ─── 5. CSV IMPORT ───
    def test_11_csv_import(self):
        self._reload()
        csv = "Study A, CBT, Placebo, -0.4, 0.2\nStudy B, Exercise, Placebo, -0.3, 0.18\nStudy C, CBT+Exercise, CBT, -0.25, 0.22"
        self.driver.find_element(By.ID, 'csvInput').send_keys(csv)
        self._click(By.ID, 'parseCsvBtn')
        time.sleep(0.3)
        rows = self.driver.find_elements(By.CSS_SELECTOR, '#compTableBody tr')
        self.assertEqual(len(rows), 3)

    # ─── 6. RUN ANALYSIS ───
    def test_12_run_smoking_analysis(self):
        self._load_smoking()
        self._run_analysis()
        content = self.driver.find_element(By.ID, 'resultsContent')
        self.assertTrue(content.is_displayed())

    def test_13_component_effects_table(self):
        self._load_smoking()
        self._run_analysis()
        rows = self.driver.find_elements(By.CSS_SELECTOR, '#resultsBody tr')
        self.assertEqual(len(rows), 4)  # 4 components: Self-help, Individual, Group, Pharmacotherapy

    def test_14_forest_plot_rendered(self):
        self._load_smoking()
        self._run_analysis()
        svg = self.driver.find_element(By.CSS_SELECTOR, '#forestSvg svg')
        self.assertIsNotNone(svg)
        circles = svg.find_elements(By.TAG_NAME, 'circle')
        self.assertEqual(len(circles), 4)

    def test_15_model_fit_shown(self):
        self._load_smoking()
        self._run_analysis()
        fit = self.driver.find_element(By.ID, 'modelFit')
        self.assertIn('Q-statistic', fit.text)
        self.assertIn('24', fit.text)  # 24 comparisons
        # Verify random-effects heterogeneity metrics are displayed
        self.assertIn('tau', fit.text)
        self.assertIn('I', fit.text)
        self.assertIn('Heterogeneity', fit.text)

    def test_16_treatment_rankings(self):
        self._load_smoking()
        self._run_analysis()
        rows = self.driver.find_elements(By.CSS_SELECTOR, '#rankBody tr')
        self.assertGreater(len(rows), 0)

    # ─── 7. NETWORK TAB ───
    def test_17_network_graph(self):
        self._load_smoking()
        self._run_analysis()
        self._click(By.ID, 'tab-network')
        time.sleep(0.3)
        content = self.driver.find_element(By.ID, 'networkContent')
        self.assertTrue(content.is_displayed())

    def test_18_network_svg(self):
        self._load_smoking()
        self._run_analysis()
        self._click(By.ID, 'tab-network')
        time.sleep(0.3)
        svg_html = self.driver.find_element(By.ID, 'networkSvg').get_attribute('innerHTML')
        self.assertIn('circle', svg_html)
        self.assertIn('Component Network', svg_html)

    def test_19_design_matrix(self):
        self._load_smoking()
        self._run_analysis()
        self._click(By.ID, 'tab-network')
        time.sleep(0.3)
        matrix = self.driver.find_element(By.ID, 'designMatrix')
        rows = matrix.find_elements(By.TAG_NAME, 'tr')
        self.assertGreater(len(rows), 1)  # header + data rows

    # ─── 8. REPORT TAB ───
    def test_20_methods_text(self):
        self._load_smoking()
        self._run_analysis()
        self._click(By.ID, 'tab-report')
        time.sleep(0.3)
        methods = self.driver.find_element(By.ID, 'methodsText')
        self.assertIn('Welton', methods.text)
        self.assertIn('additive', methods.text)

    def test_21_r_code(self):
        self._load_smoking()
        self._run_analysis()
        self._click(By.ID, 'tab-report')
        time.sleep(0.3)
        rcode = self.driver.find_element(By.ID, 'rCode')
        self.assertIn('netmeta', rcode.text)
        self.assertIn('netcomb', rcode.text)

    # ─── 9. DARK MODE ───
    def test_22_dark_mode(self):
        self._reload()
        btn = self.driver.find_element(By.ID, 'themeToggle')
        self.driver.execute_script("arguments[0].click()", btn)
        time.sleep(0.2)
        theme = self.driver.find_element(By.TAG_NAME, 'html').get_attribute('data-theme')
        self.assertEqual(theme, 'dark')
        self.driver.execute_script("arguments[0].click()", btn)

    # ─── 10. TAB NAVIGATION ───
    def test_23_tab_navigation(self):
        self._click(By.ID, 'tab-network')
        time.sleep(0.2)
        panel = self.driver.find_element(By.ID, 'panel-network')
        self.assertIn('active', panel.get_attribute('class'))
        self._click(By.ID, 'tab-data')

    def test_24_clear_data(self):
        self._load_smoking()
        self._click(By.ID, 'clearBtn')
        time.sleep(0.2)
        rows = self.driver.find_elements(By.CSS_SELECTOR, '#compTableBody tr')
        self.assertEqual(len(rows), 0)

    # ─── 11. DEPRESSION ANALYSIS ───
    def test_25_depression_five_components(self):
        self._reload()
        self._click(By.ID, 'exDepression')
        time.sleep(0.3)
        self._run_analysis()
        rows = self.driver.find_elements(By.CSS_SELECTOR, '#resultsBody tr')
        self.assertEqual(len(rows), 5)  # CBT, Exercise, Mindfulness, Pharmacotherapy, Psychoeducation


if __name__ == '__main__':
    unittest.main(verbosity=2)
