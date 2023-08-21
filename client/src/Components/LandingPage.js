import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { parse as uuidParse, v4 as uuidV4 } from "uuid"
import { ToastContainer, toast } from 'react-toastify';
import "./LandingPage.css"

export default function LandingPage() {
    const [documentId, setDocumentId] = useState("")
    const [username, setUsername] = useState("")
    const navigate = useNavigate()

    const createDocumentId = () => {
        setDocumentId(uuidV4())
    }
    const handleCreateDocument = (e) => {
        try {
            e.preventDefault();
            documentId && uuidParse(documentId) && username && navigate(`/documents/${documentId}`, { state: { username } })
        }
        catch {
            toast.error("Invalid document ID")
        }
    }

    return (
        <div className="joinBoxWrapper">
            <form className="joinBox" onSubmit={handleCreateDocument}>
                <p className='para'>Paste your Document ID down below</p>

                <div className="joinBoxInputWrapper">
                    <input
                        className="joinBoxInput"
                        id="documentIdInput"
                        type="text"
                        placeholder="Enter Document ID"
                        required
                        onChange={(e) => { setDocumentId(e.target.value) }}
                        value={documentId}
                        autoSave="off"
                        autoComplete="off"
                    />
                </div>

                <div className="joinBoxInputWrapper">
                    <input
                        className="joinBoxInput"
                        id="usernameInput"
                        type="text"
                        placeholder="Enter Guest Username"
                        required
                        value={username}
                        onChange={e => { setUsername(e.target.value) }}
                        autoSave="off"
                        autoComplete="off"
                    />
                </div>

                <button className="joinBoxBtn" type="submit">Start Editing</button>
                <p className='para'>Don't have Document ID? &nbsp;
                    <span
                        style={{ textDecoration: "underline", cursor: "pointer" }}
                        onClick={createDocumentId}
                    >Create new Document</span>
                </p>
            </form>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={false}
                theme="light"
            />
        </div>
    )
}