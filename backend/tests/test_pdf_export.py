import pytest
import base64
from reports.export.pdf_generator import PDFExportService

def test_pdf_export_initialization():
    """Asserts that the PDF binary mocking service stands up without system faults."""
    service = PDFExportService()
    assert service.template_version == "v2.1"

def test_pdf_html_buffer_compilation():
    """Validates that nested JSON elements are correctly translated into the Jinja HTML buffer."""
    service = PDFExportService()
    
    mock_report = {
        "snapshot": {
            "description": "NVDA Corp"
        }
    }
    
    html = service._generate_html_buffer(mock_report)
    
    assert "NVDA Corp" in html
    assert "InvestIQ Intelligence Report" in html
    assert "<html>" in html

def test_pdf_base64_encryption_output():
    """
    Verifies that the generated pseudo-PDF binary satisfies Network transit requirements 
    by correctly padding and converting to valid Base64 outputs.
    """
    service = PDFExportService()
    
    mock_report = {
        "snapshot": {"description": "AAPL"}
    }
    
    b64_output = service.export_to_base64_pdf(mock_report)
    
    assert isinstance(b64_output, str)
    assert len(b64_output) > 20
    
    # Ensure it's valid base64 by decoding it back
    decoded_bytes = base64.b64decode(b64_output)
    decoded_str = decoded_bytes.decode('utf-8')
    
    assert "%%PDF-1.4" in decoded_str
    assert "%%EOF" in decoded_str
