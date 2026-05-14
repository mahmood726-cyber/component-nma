from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_required_files_exist():
    required = [
        ROOT / "component-nma.html",
        ROOT / "index.html",
        ROOT / "e156-submission" / "index.html",
        ROOT / "README.md",
        ROOT / "test_component_nma.py",
        ROOT / "tests" / "test_componentnma.py",
    ]
    missing = [str(path.relative_to(ROOT)) for path in required if not path.exists()]
    assert not missing, f"Missing required Component NMA files: {missing}"


def test_dashboard_contract_markers_exist():
    html = (ROOT / "component-nma.html").read_text(encoding="utf-8")

    for marker in [
        "Component NMA",
        'id="exSmoking"',
        'id="runBtn"',
        'id="compTableBody"',
        'id="resultsBody"',
        'id="networkSvg"',
        'id="forestSvg"',
        "function runComponentNMA()",
        "function loadDataset(key)",
        "function renderResults()",
    ]:
        assert marker in html


def test_submission_page_has_valid_e156_contract():
    submission = (ROOT / "e156-submission" / "index.html").read_text(encoding="utf-8")

    assert "Component NMA" in submission
    assert "A Browser-Based Tool for Additive Component Network Meta-Analysis" in submission
    assert '"detail": "Found 156 words."' in submission
    assert "wc === 156" in submission


def test_index_links_to_submission_and_dashboard():
    index = (ROOT / "index.html").read_text(encoding="utf-8")

    assert "e156-submission/index.html" in index
    assert "e156-submission/assets/component-nma.html" in index
    assert "{{" not in index
