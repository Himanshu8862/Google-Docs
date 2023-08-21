import React, { useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import { io } from "socket.io-client"
import { useLocation, useParams } from 'react-router-dom'
import { saveAs } from "file-saver";
import { pdfExporter } from "quill-to-pdf";
import { undo, redo, exportpdf } from "../icons/icons"
import { ToastContainer, toast } from 'react-toastify';
import copy from "copy-to-clipboard";
import logo from "../icons/logo.svg"
import avatar from "../icons/avatar.svg"
import "quill/dist/quill.snow.css"
import 'react-toastify/dist/ReactToastify.css';
import "./TextEditor.css"

const SAVE_INTERVAL_MS = 2000
const fontSizeArr = ['8px', '9px', '10px', '12px', '14px', '16px', '20px', '24px', '32px', '42px', '54px', '68px', '84px', '98px'];
const Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
Quill.register(Size, true);

const icons = Quill.import("ui/icons");
icons["undo"] = undo;
icons["redo"] = redo;
icons["exportpdf"] = exportpdf;


const toolbarOptions = [
    ["exportpdf"],
    [{ 'font': [] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'size': fontSizeArr }],
    ['undo', 'redo'],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    [{ 'align': [] }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['clean']
];

export default function TextEditor() {
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()
    const [title, setTitle] = useState("Untitled Document")
    const { id: documentId } = useParams()
    const location = useLocation()

    const user = location.state.username;

    useEffect(() => {
        const s = io(
            "https://google-docs-backend-3l6d.onrender.com"
            // "http://localhost:5000"
        )
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socket == null || quill == null) return
        socket.on("load-document", (document) => {
            quill.setContents(document)
            quill.enable()
        })

        socket.emit("get-document", documentId)

        return () => {
            socket.off("load-document")
        }
    }, [socket, quill, documentId])

    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() => {
            socket.emit("save-document", quill.getContents())
        }, SAVE_INTERVAL_MS);

        return () => {
            clearInterval(interval)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return
            socket.emit("send-changes", delta)
        }
        quill.on("text-change", handler)

        return () => {
            quill.off("text-change", handler)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta) => {
            quill.updateContents(delta)
        }
        socket.on("changes-received", handler)

        return () => {
            socket.off("changes-received", handler)
        }
    }, [socket, quill])


    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return

        wrapper.innerHTML = ""
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q = new Quill(editor, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        "undo": () => {
                            handleUndo();
                        },
                        "redo": () => {
                            handleRedo();
                        },
                        "exportpdf": () => {
                            exportAsPDF();
                        }
                    }
                },

            }
        });
        q.disable()
        q.setText("Loading... Please Wait")
        setQuill(q)

        const handleUndo = () => {
            q.history.undo()
        }
        const handleRedo = () => {
            q.history.redo()
        }
        const exportAsPDF = async () => {
            const delta = q.getContents();
            const pdfAsBlob = await pdfExporter.generatePdf(delta);
            saveAs(pdfAsBlob, `${title}.pdf`);
        };
    }, [title])


    return (
        <>
            <div className="header">
                <img className="docs-icon" alt="" src={logo} />
                <input className="untitled-document" type="text"
                    title="Rename"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                />
                <button className="file">File</button>
                <button className="edit">Edit</button>
                <button className="insert">Insert</button>
                <button className="sharebutton" onClick={() => { copy(documentId); toast.success("Document ID copied!"); }}>
                    <div className="primary">Share</div>
                </button>
                <button><img className="vector-icon" alt="" src={avatar} title={user}/></button>
            </div>
            <div className='container' ref={wrapperRef}></div>
            <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={false}
                theme="light"
            />
        </>
    )
}