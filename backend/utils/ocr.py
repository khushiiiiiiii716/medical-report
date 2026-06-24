import os
import pytesseract
from PIL import Image
from pypdf import PdfReader

# Configure tesseract path on Windows if needed
# We already checked that tesseract is in the system PATH, so calling it directly should work.
# If there are issues, the user can configure the path in environment variables.
TESSERACT_CMD = os.getenv("TESSERACT_CMD")
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

def extract_text_from_pdf(file_path):
    """
    Extracts text from a digital PDF using pypdf.
    """
    try:
        reader = PdfReader(file_path)
        text = ""
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"\n--- Page {i+1} ---\n" + page_text
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def extract_text_from_image(file_path):
    """
    Extracts text from an image (PNG, JPG, JPEG) using Tesseract OCR.
    """
    try:
        image = Image.open(file_path)
        # Convert to RGB if needed
        if image.mode not in ('L', 'RGB'):
            image = image.convert('RGB')
        
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from image via OCR: {e}")
        return ""

def extract_text(file_path):
    """
    Determines file type and extracts text accordingly.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    _, ext = os.path.splitext(file_path.lower())
    
    if ext == '.pdf':
        text = extract_text_from_pdf(file_path)
        # If the PDF is scanned and text is empty, we can return a message.
        # Note: Scanned PDF page-to-image OCR is not supported out-of-the-box due to poppler dependency,
        # so we encourage uploading images or digital PDFs.
        if not text.strip():
            return "[Scanned PDF Detected] - This PDF contains scanned images. For scanned documents, please upload direct image files (PNG/JPG) for high-accuracy OCR text extraction."
        return text
    elif ext in ['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.bmp']:
        return extract_text_from_image(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Please upload a PDF or an Image file.")
