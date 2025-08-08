// DocumentEditor.js
import { useState, useEffect, useRef } from "react";
import { DocumentEditorContainerComponent, Toolbar as DocumentEditorToolbar } from "@syncfusion/ej2-react-documenteditor";
import { registerLicense } from "@syncfusion/ej2-base";
import TitleBar from "./Titlebar";
import Authentication from "./Authentication";

DocumentEditorContainerComponent.Inject(DocumentEditorToolbar);

let defaultDocument = '';

function DocumentEditor() {
  const [user, setUser] = useState(null);
  const titleBarRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (user && containerRef.current) {
      convertDocxToSfdt();
      containerRef.current.documentEditor.open(JSON.stringify(defaultDocument));
      containerRef.current.documentEditor.documentName = "Document";
      containerRef.current.documentEditor.currentUser = user.email;
      titleBarRef.current = new TitleBar(
        document.getElementById("documenteditor_titlebar"),
        containerRef.current.documentEditor,
        true
      );
      titleBarRef.current.updateDocumentTitle();

      containerRef.current.documentChange = () => {
        titleBarRef.current.updateDocumentTitle();
        containerRef.current.documentEditor.focusIn();
      };
    }
  }, [user]);

  // Convert GitHub Raw document to SFDT and load in Editor.
  const convertDocxToSfdt = async () => {
    try {
      const docxResponse = await fetch('https://raw.githubusercontent.com/SyncfusionExamples/Role-Based-Access-and-Restrict-Editing-in-React-Word-Editor/master/Client-side/public/docs/Vendor_Agreement.docx');
      const docxBlob = await docxResponse.blob();

      const formData = new FormData();
      formData.append('files', docxBlob, 'Vendor_Agreement.docx');

      const importResponse = await fetch('https://ej2services.syncfusion.com/production/web-services/api/documenteditor/Import', {
        method: 'POST',
        body: formData,
      });

      if (importResponse.ok) {
        defaultDocument = await importResponse.text();
        containerRef.current.documentEditor.open(defaultDocument);
      } else {
        console.error(`Failed to import document: ${importResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error converting document:', error);
    }
  };


  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return <Authentication onLogin={setUser} />;
  }

  return (
    <div>
      <div className="main-titlebar" style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", alignItems: "center", background: "#f0f0f0" }}>
        <p className="welcome-text" style={{ margin: 0 }}>Welcome, {user.username || user.email}</p>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
      <div id="documenteditor_titlebar" className="e-de-ctn-title"></div>
      <style>
        {`.e-toolbar-items {
          display: flex !important;
          justify-content: center !important;
        }`}
      </style>
      <DocumentEditorContainerComponent
        ref={containerRef}
        id="container"
        height="calc(100vh - 92px)"
        enableToolbar={true}
      />
    </div>
  );
}

export default DocumentEditor;
