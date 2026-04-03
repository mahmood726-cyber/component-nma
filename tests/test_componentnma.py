"""
Component NMA -- Selenium Test Suite (pytest)
~20 tests: page load, tabs, examples, analysis, league/ranking tables,
forest plot, theme toggle, export, interactions, CSV import.

Run:  python -m pytest tests/test_componentnma.py -v
"""
import sys, os, time, pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

HTML_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), os.pardir, "component-nma.html"
)
URL = "file:///" + os.path.normpath(HTML_FILE).replace("\\", "/")


# ── Fixtures ────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def driver():
    """Shared headless Chrome instance for the entire module."""
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1400,900")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    d = webdriver.Chrome(options=opts)
    d.implicitly_wait(2)
    yield d
    # Report severe JS errors on teardown
    try:
        logs = d.get_log("browser")
        severe = [
            l for l in logs
            if l["level"] == "SEVERE" and "favicon" not in l.get("message", "")
        ]
        if severe:
            print(f"\nSEVERE JS ERRORS ({len(severe)}):")
            for l in severe:
                print(f"  {l['message']}")
    except Exception:
        pass
    d.quit()


def _reload(driver):
    """Navigate to the app and override confirm/alert to auto-accept."""
    driver.get(URL)
    driver.execute_script("window.confirm = () => true; window.alert = () => {};")
    time.sleep(0.4)


def _js_click(driver, by, val):
    """Wait for element, then JS-click (avoids ElementNotInteractableException)."""
    el = WebDriverWait(driver, 5).until(EC.presence_of_element_located((by, val)))
    driver.execute_script("arguments[0].click()", el)
    return el


def _load_smoking(driver):
    _reload(driver)
    _js_click(driver, By.ID, "exSmoking")
    time.sleep(0.3)


def _run_analysis(driver):
    _js_click(driver, By.ID, "runBtn")
    time.sleep(0.6)


# ── 1. Page Load ────────────────────────────────────────────────────

class TestPageLoad:
    def test_title(self, driver):
        """Page title contains 'Component NMA'."""
        _reload(driver)
        assert "Component NMA" in driver.title

    def test_hero_visible(self, driver):
        """Hero banner shows app name."""
        hero = driver.find_element(By.CSS_SELECTOR, ".hero-title")
        assert "Component NMA" in hero.text

    def test_four_tabs(self, driver):
        """Exactly 4 tab buttons in the tab bar."""
        tabs = driver.find_elements(By.CSS_SELECTOR, ".tab-btn")
        assert len(tabs) == 4

    def test_empty_state_on_load(self, driver):
        """Empty-state message visible before any data is loaded."""
        _reload(driver)
        empty = driver.find_element(By.ID, "emptyData")
        assert empty.is_displayed()


# ── 2. Tab Navigation ──────────────────────────────────────────────

class TestTabs:
    def test_switch_to_network_tab(self, driver):
        """Clicking the Network tab activates its panel."""
        _reload(driver)
        _js_click(driver, By.ID, "tab-network")
        time.sleep(0.2)
        panel = driver.find_element(By.ID, "panel-network")
        assert "active" in panel.get_attribute("class")

    def test_switch_to_results_tab(self, driver):
        """Clicking the Results tab activates its panel."""
        _js_click(driver, By.ID, "tab-results")
        time.sleep(0.2)
        panel = driver.find_element(By.ID, "panel-results")
        assert "active" in panel.get_attribute("class")

    def test_switch_back_to_data_tab(self, driver):
        """Returning to Data tab deactivates Results panel."""
        _js_click(driver, By.ID, "tab-data")
        time.sleep(0.2)
        panel = driver.find_element(By.ID, "panel-data")
        assert "active" in panel.get_attribute("class")
        results_panel = driver.find_element(By.ID, "panel-results")
        assert "active" not in results_panel.get_attribute("class")


# ── 3. Example Datasets ────────────────────────────────────────────

class TestExamples:
    def test_smoking_loads_24_rows(self, driver):
        """Smoking Cessation example populates 24 comparison rows."""
        _load_smoking(driver)
        rows = driver.find_elements(By.CSS_SELECTOR, "#compTableBody tr")
        assert len(rows) == 24

    def test_smoking_count_label(self, driver):
        """Count label shows '24 comparisons'."""
        count = driver.find_element(By.ID, "compCount")
        assert "24" in count.text

    def test_depression_loads_18_rows(self, driver):
        """Depression Treatment example populates 18 comparison rows."""
        _reload(driver)
        _js_click(driver, By.ID, "exDepression")
        time.sleep(0.3)
        rows = driver.find_elements(By.CSS_SELECTOR, "#compTableBody tr")
        assert len(rows) == 18

    def test_component_tags_visible(self, driver):
        """Component colour tags appear in the data table."""
        _load_smoking(driver)
        tags = driver.find_elements(By.CSS_SELECTOR, ".component-tag")
        assert len(tags) > 0


# ── 4. Analysis Runs (Smoking) ──────────────────────────────────────

class TestAnalysisSmoking:
    def test_results_panel_shown(self, driver):
        """Running analysis makes the results content visible."""
        _load_smoking(driver)
        _run_analysis(driver)
        content = driver.find_element(By.ID, "resultsContent")
        assert content.is_displayed()

    def test_four_component_effects(self, driver):
        """Smoking dataset yields exactly 4 component-effect rows."""
        rows = driver.find_elements(By.CSS_SELECTOR, "#resultsBody tr")
        assert len(rows) == 4  # Self-help, Individual, Group, Pharmacotherapy

    def test_forest_plot_rendered(self, driver):
        """Forest plot SVG contains 4 circles (one per component)."""
        svg = driver.find_element(By.CSS_SELECTOR, "#forestSvg svg")
        circles = svg.find_elements(By.TAG_NAME, "circle")
        assert len(circles) == 4

    def test_model_fit_text(self, driver):
        """Model fit section shows Q-statistic, tau^2, I^2, Heterogeneity."""
        fit = driver.find_element(By.ID, "modelFit")
        text = fit.text
        assert "Q-statistic" in text
        assert "tau" in text
        assert "I" in text
        # Confirm it references 24 comparisons
        assert "24" in text

    def test_ranking_table_populated(self, driver):
        """Ranking table has at least 1 row after analysis."""
        rows = driver.find_elements(By.CSS_SELECTOR, "#rankBody tr")
        assert len(rows) > 0

    def test_ranking_table_has_reference(self, driver):
        """Ranking table includes a reference treatment (Placebo)."""
        rank_html = driver.find_element(By.ID, "rankBody").get_attribute("innerHTML")
        assert "Placebo" in rank_html


# ── 5. League / Network Tab ────────────────────────────────────────

class TestNetworkTab:
    def test_network_svg_rendered(self, driver):
        """Network graph SVG contains circles and 'Component Network' title."""
        _load_smoking(driver)
        _run_analysis(driver)
        _js_click(driver, By.ID, "tab-network")
        time.sleep(0.3)
        svg_html = driver.find_element(By.ID, "networkSvg").get_attribute("innerHTML")
        assert "circle" in svg_html
        assert "Component Network" in svg_html

    def test_design_matrix_rows(self, driver):
        """Design matrix table has header + data rows."""
        matrix = driver.find_element(By.ID, "designMatrix")
        rows = matrix.find_elements(By.TAG_NAME, "tr")
        # 1 header row + 24 data rows = 25
        assert len(rows) >= 25


# ── 6. Report Tab / Export ──────────────────────────────────────────

class TestReportExport:
    def test_methods_text_welton(self, driver):
        """Methods text mentions Welton and additive model."""
        _load_smoking(driver)
        _run_analysis(driver)
        _js_click(driver, By.ID, "tab-report")
        time.sleep(0.3)
        methods = driver.find_element(By.ID, "methodsText")
        assert "Welton" in methods.text
        assert "additive" in methods.text

    def test_r_code_netmeta(self, driver):
        """R code block references netmeta and netcomb."""
        rcode = driver.find_element(By.ID, "rCode")
        assert "netmeta" in rcode.text
        assert "netcomb" in rcode.text

    def test_export_csv_button_present(self, driver):
        """Export CSV button is visible."""
        btn = driver.find_element(By.ID, "exportCsvBtn")
        assert btn.is_displayed()

    def test_export_json_button_present(self, driver):
        """Export JSON button is visible."""
        btn = driver.find_element(By.ID, "exportJsonBtn")
        assert btn.is_displayed()


# ── 7. Theme Toggle ────────────────────────────────────────────────

class TestTheme:
    def test_dark_mode_toggle(self, driver):
        """Toggling theme sets data-theme='dark' on <html>."""
        _reload(driver)
        _js_click(driver, By.ID, "themeToggle")
        time.sleep(0.2)
        theme = driver.find_element(By.TAG_NAME, "html").get_attribute("data-theme")
        assert theme == "dark"
        # Toggle back
        _js_click(driver, By.ID, "themeToggle")
        time.sleep(0.2)
        theme = driver.find_element(By.TAG_NAME, "html").get_attribute("data-theme")
        assert theme == "light"


# ── 8. CSV Import ──────────────────────────────────────────────────

class TestCSVImport:
    def test_csv_parses_3_rows(self, driver):
        """Pasting 3-line CSV and parsing adds 3 comparison rows."""
        _reload(driver)
        csv_data = (
            "Study A, CBT, Placebo, -0.4, 0.2\n"
            "Study B, Exercise, Placebo, -0.3, 0.18\n"
            "Study C, CBT+Exercise, CBT, -0.25, 0.22"
        )
        driver.find_element(By.ID, "csvInput").send_keys(csv_data)
        _js_click(driver, By.ID, "parseCsvBtn")
        time.sleep(0.3)
        rows = driver.find_elements(By.CSS_SELECTOR, "#compTableBody tr")
        assert len(rows) == 3


# ── 9. Clear Data ──────────────────────────────────────────────────

class TestClearData:
    def test_clear_removes_all_rows(self, driver):
        """Clear button removes all comparison rows."""
        _load_smoking(driver)
        _js_click(driver, By.ID, "clearBtn")
        time.sleep(0.2)
        rows = driver.find_elements(By.CSS_SELECTOR, "#compTableBody tr")
        assert len(rows) == 0


# ── 10. Depression Analysis ─────────────────────────────────────────

class TestAnalysisDepression:
    def test_depression_five_components(self, driver):
        """Depression dataset yields 5 component-effect rows."""
        _reload(driver)
        _js_click(driver, By.ID, "exDepression")
        time.sleep(0.3)
        _run_analysis(driver)
        rows = driver.find_elements(By.CSS_SELECTOR, "#resultsBody tr")
        assert len(rows) == 5  # CBT, Exercise, Mindfulness, Pharmacotherapy, Psychoeducation
