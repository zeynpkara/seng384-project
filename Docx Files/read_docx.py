import zipfile
import xml.etree.ElementTree as ET
import os

def extract_text_from_docx(docx_path):
    try:
        document = zipfile.ZipFile(docx_path)
        xml_content = document.read('word/document.xml')
        document.close()
        tree = ET.XML(xml_content)
        
        WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
        PARA = WORD_NAMESPACE + 'p'
        TEXT = WORD_NAMESPACE + 't'
        
        paragraphs = []
        for paragraph in tree.iter(PARA):
            texts = [node.text
                     for node in paragraph.iter(TEXT)
                     if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        
        return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error reading {docx_path}: {str(e)}"

if __name__ == '__main__':
    docx_files = [f for f in os.listdir('.') if f.endswith('.docx')]
    with open('docx_contents.txt', 'w', encoding='utf-8') as outfile:
        for f in docx_files:
            outfile.write(f"--- FILE: {f} ---\n")
            text = extract_text_from_docx(f)
            outfile.write(text + "\n")
            outfile.write("\n" + "="*50 + "\n\n")
