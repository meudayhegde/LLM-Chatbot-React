import React, { useState, useImperativeHandle, forwardRef, useRef } from "react";
import { MdCancel } from "react-icons/md";
import "./DocIndex.css"


const DropArea = forwardRef((props, ref) => {
    const inputRef = useRef(null);
    const [files, setFiles] = useState({});
    const [areaActive, setAreaActive] = useState(false);
    const [inputKey, setInputKey] = useState(Date.now());

    const allowedFileTypes = [".pdf", ".docx", ".pptx", ".txt", ".doc"];

    const removeFile = (file_id) => {
        setFiles((prevFiles) => {
            const { [file_id]: _, ...newFiles } = prevFiles;
            return newFiles;
        });
    }

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setAreaActive(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setAreaActive(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const droppedFiles = event.dataTransfer.files;
        setFiles((prevFiles) => {
            return Array.from(droppedFiles)
                .filter(file => allowedFileTypes.some(ext => file.name.toLowerCase().endsWith(ext)))
                .reduce((p, file, i) => {
                    p[`${file.name}-${file.size}-${file.type}-${file.lastModified}`] = file;
                    return p;
                }, prevFiles);
        });
        setAreaActive(false);
    };

    const handleFileSelect = (event) => {
        const selectedFiles = event.target.files;
        setFiles((prevFiles) => {
            return Array.from(selectedFiles)
                .reduce((p, file, i) => {
                    p[`${file.name}-${file.size}-${file.type}-${file.lastModified}`] = file;
                    return p;
                }, prevFiles)
        }
        );
        setInputKey(Date.now());
        setAreaActive(false);
    };

    const handleUpload = async () => {
        if (Object.keys(files).length === 0) {
            return
        }

        try {
            const formData = new FormData();
            Object.values(files).forEach((file, index) => {
                formData.append(`files`, file);
            });
            const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/form/index-documents`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setFiles({});
            alert(`Indexing complete, success: ${result.success}, failure: ${result.failure}\n`
                + `Errors:\n${result.exceptions.map(ex => "File: " + ex.file + "  Ex: " + ex.exception).join("\n")}`)
        } catch (error) {
            console.error('Error:', error);
        }

    }

    useImperativeHandle(ref, () => ({
        handleUpload: handleUpload
    }));

    return <>
        <div className={"DropArea" + (areaActive ? " drag-over" : "")} disabled={props.disabled} onClick={() => inputRef.current ? inputRef.current.click() : ''}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop }>
            <div style={{ fontWeight: 'bold', position: 'absolute', right: '10px' }}>{Object.keys(files).length}</div>
            <div className="file-container">
                {
                    Object.keys(files).map(file_id => {
                        return <div className="file-item" key={file_id}>
                            {files[file_id].name}
                            <MdCancel className="remove-btn" onClick={(e) => {
                                e.stopPropagation();
                                removeFile(file_id);
                            }} />
                        </div>
                    })
                }
            </div>
        </div>

        <input ref={inputRef} key={inputKey} disabled={props.disabled} id="documents" name="documents" type="file" multiple accept={allowedFileTypes.join(", ")}
            hidden onChange={handleFileSelect} />
    </>
});


const DocIndex = forwardRef((props, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const areaRef = useRef(null);

    const closeModal = () => setIsModalOpen(false);

    useImperativeHandle(ref, () => ({
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
    }));



    return (
        <div>
            {isModalOpen && (
                <div className="ModalRoot">
                    <div className="ModalBody" onClick={(e) => e.stopPropagation()}>
                        <h3>Index Documents</h3>
                        <DropArea ref={areaRef} disabled={loading} />
                        <div className="progress-bar-container" style={{ display: (loading ? 'block' : 'none') }}>
                            <div className="progress-bar"></div>
                        </div>
                        <div style={{ display: (loading ? 'block' : 'none'), width: '100%', fontSize: '0.8rem', marginLeft: '6px' }}>
                            Adding documents to vectorstore, this might take a while, please be patient...
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'end', width: '100%' }}>
                            <button className="cancel-button" onClick={closeModal} disabled={loading}>Cancel</button>
                            <button className="upload-button" disabled={loading} onClick={async () => {
                                if (areaRef.current) {
                                    setLoading(true);
                                    await areaRef.current.handleUpload();
                                    setLoading(false);
                                }
                            }}>Upload</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default DocIndex;