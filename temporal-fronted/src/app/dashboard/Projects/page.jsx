//page.jsx
"use client";

import { FaEdit } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import Loading from "@/app/Projects/loading";
import ButtonAdd from "@/app/components/Common/ButtonAdd";
import { Alert, AlertConfirm } from "@/app/components/Common/Alert";
import ContainerForm from "@/app/components/Forms/ContainerForm";
import InputBasic from "@/app/components/Forms/InputBasic";
import InputDate from "@/app/components/Forms/InputDate";
import InputTextArea from "@/app/components/Forms/InputTextArea";
import InputSubElementos from "@/app/components/Forms/InputSubElementos";
import InputMutipleImage from "@/app/components/Forms/InputMutipleImage";
import TablaProjects from "@/app/components/table/TablaProjects";
import InputMultipleSelection from "@/app/components/Forms/InputMultipleSelection";
import InputSelection from "@/app/components/Forms/InputSelection";
const apiUrl = process.env.NEXT_PUBLIC_API;

const Proyectos = () => {
  const defaultImagePath = "project_default.jpeg"; // Ruta de la imagen por defecto

  const [editingProject, setEditingProject] = useState(null); //Datos del proyecto a editar
  const [originalProject, setOriginalProject] = useState(null); //Datos originales del proyecto a editar
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isCreating, setIsCreating] = useState(true); // Variable para saber si se está creando un nuevo proyecto
  const [projects, setProyectos] = useState([]);

  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [currentImageIndices, setCurrentImageIndices] = useState([]);
  const [investigadores, setInvestigadores] = useState([]);

  //Seleccion de personas
  const [investigadoresExistentes, setInvestigadoresExistentes] = useState([]); //Lista de todas las personas de temporal
  const [selectedResearcher, setSelectedResearcher] = useState(""); //Guarda los nuevos colaboradores de un proyecto
  const [originalResearcher, setOriginalResearcher] = useState([]); //Guarda los colaboradores originales de un proyecto
  const [coreResearchers, setSelectCoreResearcher] = useState(""); //Guarda los nuevos investigadores principales de un proyecto
  const [originalCoreResearcher, setOriginalCoreResearcher] = useState([]); //Guarda los investigadores principales originales de un proyecto

  //Imagenes
  const [files, setFiles] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]); //Lista de imagenes a eliminar
  const [imagenes, setImagenes] = useState([]); //Lista de imagenes
  const [originalImagenes, setOriginalImagenes] = useState([]); //Lista de imagenes originales

  //Preview Imagenes
  const [coreImagePreviews, setCoreImagePreviews] = useState([]); //url
  const [imagePreviews, setImagePreviews] = useState([]); //blob
  const [previewImagenes, setpreviewImagenes] = useState([]); //blob y url

  //Alertas
  const [showDelete, setShowDelete] = useState(false); // Confirmacion para eliminar
  const [showCancel, setShowCancel] = useState(false); // Confirmacion para cancelar
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(["", ""]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentProyect, setCurrentProyect] = useState(null);

  const [isLoading, setIsLoading] = useState(true); // Para controlar si estamos cargando los datos iniciales
  const [submitComplete, setSubmitComplete] = useState(false); // Para verificar si se hizo un submit
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const proyectosResponse = await fetch(`${apiUrl}/api/proyectos`);
        const imagenesResponse = await fetch(`${apiUrl}/api/imagenes`);
        const investigadoresResponse = await fetch(`${apiUrl}/api/personas`);

        if (
          !proyectosResponse.ok ||
          !imagenesResponse.ok ||
          !investigadoresResponse.ok
        ) {
          throw new Error("Network response was not ok");
        }

        const proyectosData = await proyectosResponse.json();
        const imagenesData = await imagenesResponse.json();
        const investigadoresData = await investigadoresResponse.json();

        setProyectos(proyectosData.data || []);
        setImagenes(imagenesData.data || defaultImagePath);
        setInvestigadoresExistentes(investigadoresData.data || []);
        setCurrentImageIndices(Array(proyectosData.data.length).fill(0));
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        //console.error("Error fetching data:", error);
      }
    };

    if (isLoading) {
      fetchData();
    }
  }, [isLoading]);
 
  useEffect(() => {
    if (submitComplete) {
      const fetchDataAfterSubmit = async () => {
        try {
          const updatedResponse = await fetch(`${apiUrl}/api/proyectos`);
          const updatedData = await updatedResponse.json();
          setProyectos(updatedData.data);
        } catch (error) {
          console.error("Error fetching updated data:", error);
        }
      };
  
      fetchDataAfterSubmit();
      setSubmitComplete(false); // Resetear el estado para evitar que se ejecute más veces
    }
  }, [submitComplete]);

  /*
  //------------------------------- intervalo de imagenes -------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndices((prevIndices) =>
        prevIndices.map((currentIndex, projectIndex) => {
          const nextIndex =
            (currentIndex + 1) % projects[projectIndex]?.imagenes.length;
          return nextIndex;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [projects]);
 */
  //------------------------------------- Debugging -------------------------------------

  useEffect(() => {
    //console.log("Current editing project:", editingProject);
  }, [editingProject, projects]);
  useEffect(() => {
    //console.log("Core Researcher Originales", originalCoreResearcher);
  }, [originalCoreResearcher]);
  useEffect(() => {
    //console.log("Colaborators Originales:", originalResearcher);
  }, [originalResearcher]);
  useEffect(() => {
    // Cuando imagePreviews cambia, asegura que la interfaz se actualice
    //console.log("Imagenes previas actualizadas:", imagePreviews);
  }, [imagePreviews]);
  
  useEffect(() => {
    // Cuando coreImagePreviews cambia, actualiza las imágenes principales en el proyecto
    //console.log("Imagen principal actualizada:", coreImagePreviews);
  }, [coreImagePreviews]);
  /*
  useEffect(() => {
    //console.log("coreImagePreviews:", coreImagePreviews);
  }, [coreImagePreviews]); 
  useEffect(() => {
    //console.log("imagePreviews:", imagePreviews);
  }, [imagePreviews]);
  useEffect(() => {
    //console.log("previewImagenes:", previewImagenes);
  }, [previewImagenes]); 
  */
  //------------------------------------- Manejo de los cambios -------------------------------------

  // Funcion que maneja la edicion de un proyecto (Carga los datos del proyecto en el formulario)
  const handleEditClick = (project) => {
    ////console.log("Proyecto seleccionado:", project);
    setIsCreating(false);
    setAlertMessage(["", "Changes saved successfully"]);
    setEditingProject({ ...project });

    //Colaborators:
    setSelectedResearcher(
      project.investigadores.map((investigador) => investigador.investigador_id)
    );
    setOriginalResearcher(
      project.investigadores.map((investigador) => investigador.investigador_id)
    );

    //Core Researchers:
    setSelectCoreResearcher(
      project.coreResearchers.map(
        (investigador) => investigador.investigador_id
      )
    );
    setOriginalCoreResearcher(
      project.coreResearchers.map(
        (investigador) => investigador.investigador_id
      )
    );

    //Imagenes:
    /*
    setOriginalProject({ ...project });
    setOriginalImagenes(project.imagenes.map((imagen) => imagen.url));

    setImagePreviews(
      project.imagenes.map((imagen) => imagen.url || defaultImagePath)
    );
    setCoreImagePreviews(
      project.imagenes.map((imagen) => imagen.url || defaultImagePath)
    );*/
    setOriginalProject({ ...project });
    setOriginalImagenes(project.imagenes.map((imagen) => imagen.url));

    const previews =
      project.imagenes.length === 0
        ? [defaultImagePath]
        : project.imagenes.map((imagen) => imagen.url);

    setImagePreviews(previews);
    setCoreImagePreviews(previews);

    // Asignar la imagen por defecto también al proyecto
    if (previews.length === 0) {
      setEditingProject((prev) => ({
        ...prev,
        imagenes: [{ url: defaultImagePath }],
        core_image: defaultImagePath,
      }));
    } else {
      setEditingProject((prev) => ({
        ...prev,
        imagenes: project.imagenes,
        core_image: project.imagenes[0]?.url || defaultImagePath,
      }));
    }
  };

  // Funcion que maneja los cambios realizados en el proyecto
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditingProject((prev) => ({ ...prev, [name]: value }));
  };

  // Funcion que maneja los cambios en los investigadores de un proyecto
  const handleInputChangeResearcher = (selectedResearchers) => {
    setSelectedResearcher(selectedResearchers);
    ////console.log("selectedResearchers: ", selectedResearchers);
  };

  const handleInputChangeCoreResearcher = (coreResearchers) => {
    setSelectCoreResearcher(coreResearchers);
    ////console.log("coreResearchers: ", coreResearchers);
  };

  //------------------------------------- Imagenes -------------------------------------

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      const filteredPreviews = imagePreviews.filter(preview => preview !== "project_default.jpeg");
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      const fileNames = selectedFiles.map(file => file.name);
      setFiles(selectedFiles);
      setCoreImagePreviews([...filteredPreviews, ...fileNames]);
      setImagePreviews([...filteredPreviews, ...previews]);
    }
  };

  // Función para manejar el cambio de la imagen
  const handlePhotoChange = async (filepath) => {
    const files = filepath;

    if (!files) {
      return;
    }

    if (files.some(file => !file.type.startsWith("image/"))) {
      alert("Warning", "Please select only image files.", "");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append('category', "projects");  

    //const previewImage = URL.createObjectURL(file);
    let path = [];
    
    try{
      const response = await fetch(`${apiUrl}/api/multer/${formData.get("category")}`, {
          method: 'POST',
          body: formData,
      });
      if (!response.ok) {
          throw new Error("Hubo un error al cargar el archivo.");
        }
      path = await handleVerificarArchivo(formData);

      //console.log("¡Archivo cargado exitosamente!, path:", path);
      return path;
      setFoto(null);
      } catch {
          console.log("Error al subir la foto");
      } 

  };
 
  //Funcion que verifica si el archivo fue subido correctamente
  const handleVerificarArchivo = async (formData) => {
    const images = formData.getAll("images"); 
    const category = "projects";
    const paths = [];
    for(let file of images){
      
      try{
        
        const response = await fetch(`${apiUrl}/api/multer/file-exists`, {
          method: "POST",
          body: JSON.stringify({ file: file.name, category }),
          headers: {
            'Content-Type': 'application/json',  
          },
        });

        if (!response.ok) {
          throw new Error("Hubo un error al cargar el archivo.");
        }

        const data = await response.json();//contiene el path del archivo
        //console.log("data Verifica: ", data); 
        const cleanPath = data.newFilePath.replace(/^(\.\.\/)/, '');
        const parts = cleanPath.split("/");
        const name = parts.slice(1).join("/");

         paths.push(name);
        
        //console.log("ruta: ", data.newFilePath)
        
      }catch(error){
        return null;
      }
    }
    return paths;
  };

  // Función para manejar la eliminación de una imagen en la bd y front
  const handleImageDelete  = async (imageUrl) => {
    

    // Si la imagen es la predeterminada, no hacemos nada
    if (imageUrl === defaultImagePath) {
      return;
    }

    // Eliminar de la lista de imágenes del proyecto
    setEditingProject((prev) => ({
      ...prev,
      imagenes: originalImagenes.filter((imagen) => imagen.url !== imageUrl),
    }));

    // Agregar a la lista de imágenes a eliminar
    setImagesToDelete((prev) => [...prev, imageUrl]);

    // Eliminar de las vistas previas de la imagen
    setImagePreviews((prev) => prev.filter((preview) => preview !== imageUrl));

    // Iterar sobre previewImagenes y eliminar la imagen
    for (let j = 0; j < previewImagenes.length; j++) {
      // Comprobar si la imagen está dentro de previewImagenes[j][1]
      if (previewImagenes[j][1].includes(imageUrl)) {
        const indice = previewImagenes[j][1].indexOf(imageUrl);

        // Obtener la URL de la imagen asociada
        const imagePreviewToRemove = previewImagenes[j][0][indice];

        // Eliminar de las vistas previas
        setCoreImagePreviews((prev) =>
          prev.filter((preview) => preview !== imagePreviewToRemove)
        );

        break; // Salir del bucle una vez que se haya encontrado y eliminado la imagen
      }
    }

    // Función para extraer el nombre de la imagen si está en previewImagenes
    const extractImageName = (url) => {
      for (let i = 0; i < previewImagenes.length; i++) {
        const rutas = previewImagenes[i][1]; // Rutas de las imágenes (nombres de archivos)
        if (rutas.includes(url)) {
          // Devolver el nombre de archivo correspondiente
          return previewImagenes[i][0][rutas.indexOf(url)];
        }
      }
      return null; // Si no se encuentra el nombre
    };

    // Verificar si la URL de la imagen coincide con el patrón '/Images/*'
    if (/(\w+)(\(\d+\))?\.(\w+)/.test(imageUrl)) {
      setCoreImagePreviews((prev) =>
        prev.filter((preview) => preview !== imageUrl)
      );
    } else {
      const urlPreview = extractImageName(imageUrl);
      if (urlPreview) {
        setCoreImagePreviews((prev) =>
          prev.filter((preview) => preview !== urlPreview)
        );

      }
    }

    // Si solo queda la imagen predeterminada, restablecer la imagen
    if (
      editingProject.imagenes.length === 1 &&
      editingProject.imagenes[0].url !== defaultImagePath
    ) {
      setEditingProject((prev) => ({
        ...prev,
        imagenes: [{ url: defaultImagePath }],
        core_image: defaultImagePath,
      }));
      setImagePreviews([defaultImagePath]);
      setCoreImagePreviews([defaultImagePath]);
    }
  };
  
  //Funcion que maneja la eliminacion de una imagen en el servidor
  const handleDeleteServerImagen = async (imageUrl) => {
    if (imageUrl !== defaultImagePath) {
      //console.log("imagen a eliminar: ", imageUrl);
      try {
        // Llamamos a la API para eliminar el archivo, pasando solo el nombre del archivo
        const response = await fetch(`${apiUrl}/api/multer/delete-file`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filename: imageUrl, categoria: "projects" }),
        });
    
        // Verificamos si la respuesta es correcta
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
    
        // Si la eliminación fue exitosa
        //console.log("Imagen eliminada con éxito.");
      } catch (error) {
        // Si hubo un error al intentar eliminar la imagen
        console.error("Error deleting file:", error);
      }


    }else{
      console.log("No se puede eliminar la imagen por defecto");
    }
  };


  //------------------------------------- Solicitudes a la BD -------------------------------------

  //Funcion que maneja el envio de los cambios a la BD (Crear o editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    ////console.log("Proyecto a guardar:", editingProject);

    //Funcion que da la alerta de que code_project es algo diferente a INT (code_project es INT)
    if (isNaN(editingProject.code_project)) {
      setAlertMessage(["Error", "The project code must be an integer"]);
      setShowAlert(true);
      return;
    }

    if (editingProject.end_date !== "" && editingProject.start_date > editingProject.end_date) {
      setAlertMessage(["Error", "The start date must be before the end date"]);
      setShowAlert(true);
      return;
    }

    if (!coreResearchers || coreResearchers.length === 0) {
      setAlertMessage([
        "Error",
        "At least one core researcher must be selected.",
      ]);
      setShowAlert(true);
      return;
    }


    for (const imageUrl of imagesToDelete) {
      //console.log("Imagen a eliminar: ", imageUrl);
      await handleDeleteServerImagen(imageUrl);
    }


    let path = [];
    if (!files || !files.length){
      setEditingProject((prev) => ({
        ...prev,
        imagenes: [{ url: defaultImagePath }],
        core_image: defaultImagePath,
      }));
    }else{
      path = await handlePhotoChange(files);
      //console.log("path del verificar: ", path);
      
      
    }


    // Si no se han seleccionado imágenes, asignamos la imagen por defecto
    //Este puede ser el problema, se hace la modificacion en el front pero no al momento de guardar
    if (editingProject.imagenes.length === 0) {
      setEditingProject((prev) => ({
        ...prev,
        imagenes: [{ url: defaultImagePath }],
        core_image: defaultImagePath,
      }));
    }

    const method = editingProject.id ? "PUT" : "POST"; // Si tiene id, es PUT, si no es POST
    const url = editingProject.id
      ? `${apiUrl}/api/proyectos/${editingProject.id}` // Actualizar
      : `${apiUrl}/api/proyectos`; // Crear nuevo
    ////console.log("metodo: ", method); //metodo:  PUT

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editingProject,
          investigadores: selectedResearcher,
          coreResearchers: coreResearchers,
          imagenes: path,
          imagenes_eliminadas: imagesToDelete,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Captura el error del servidor
        //console.error("Error details: ", errorData);
        setAlertMessage([
          "Error",
          `Error saving project: ${errorData.message || "Undefined"}`,
        ]);
        setShowAlert(true);
        return;
      }

      const updatedResponse = await fetch(`${apiUrl}/api/proyectos`);
      const updatedData = await updatedResponse.json();
      setProyectos(updatedData.data);
      //setCurrentImageIndices(Array(updatedData.projects.length).fill(0));
      // Si la solicitud es exitosa:
      path = [];
      setSubmitComplete(true);
      setEditingProject(null);
      setImagePreviews(defaultImagePath);
      setCoreImagePreviews([]);
      setpreviewImagenes([]);
      setSelectCoreResearcher([]);
      setSelectedResearcher([]);
      setSelectedFiles([]);
      setImagesToDelete([]);
      setAlertMessage(["", "Project saved successfully"]);
      setShowAlert(true);
      setFiles(null);
    } catch (error) {
      //console.error("Error in request: ", error);
      setAlertMessage([
        "Error",
        `There was a problem with the request: ${error.message}`,
      ]);
      setShowAlert(true);
    }
  };

  //Funcion que maneja la eliminacion de un proyecto
  const handleDeleteProyecto = async (id) => {
    try {
      // Elimina las imágenes del servidor
    
      const project = projects.find(project => project.id === id);
      //console.log("Proyecto a eliminar: ", project);
      for (const image of project.imagenes) {
        //console.log("Imagen a eliminar: ", image.url); // Accedemos a la propiedad url de cada objeto
        await handleDeleteServerImagen(image.url);
      }
      
      

      //Elimina el proyecto de la base de datos
      const response = await fetch(`${apiUrl}/api/proyectos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Actualizamos el estado de proyectos eliminando el proyecto con el id correspondiente
        setProyectos((prevProjects) =>
          prevProjects.filter((project) => project.id !== id)
        );
        setEditingProject(null); // Limpiamos el estado de proyecto en edición
        setSelectedResearcher(""); // Limpiamos el estado de investigadores seleccionados
        setSelectCoreResearcher(""); // Limpiamos el estado de investigadores seleccionados
        setAlertMessage(["", "Project deleted successfully"]);
        setShowAlert(true);
      } else {
        setAlertMessage(["Error", "Error deleting project"]);
        setShowAlert(true);
      }
    } catch (error) {
      //console.error("Error al eliminar el proyecto:", error);
      setAlertMessage(["Error", "There was a problem deleting the project"]);
      setShowAlert(true);
    }
  };

  //------------------------------------- Formulario -------------------------------------

  //Funcion que maneja la creacion de un nuevo proyecto (Deja vacio el formulario)
  const handleAddClick = () => {
    setAlertMessage(["", "New Project added successfully"]);
    setIsCreating(true);

    setEditingProject({
      title: "",
      subtitle: "",
      abstract: "",
      description_: "",
      start_date: "",
      end_date: "",
      state_: "",
      code_project: "",
      core_image: "",
      imagenes: [{ url: "" }],
    });

    ////console.log("imagenes: " + JSON.stringify(editingProject));
    setSelectedResearcher("");
    setSelectCoreResearcher("");
    setOriginalImagenes([]);
    setImagePreviews([defaultImagePath]);
    setCoreImagePreviews([defaultImagePath]);
    setpreviewImagenes([]);
    setImagesToDelete([]);
  };

  // Función para verificar si hay cambios en el formulario
  const hasChanges = () => {
    // Compara el proyecto editado con el proyecto original
    const projectChanged =
      JSON.stringify(editingProject) !== JSON.stringify(originalProject);
    // Compara la lista de investigadores seleccionados con la original
    const researchersChanged =
      JSON.stringify(selectedResearcher) !== JSON.stringify(originalResearcher);
    // Compara la lista de investigadores principales seleccionados con la original
    const coreResearchersChanged =
      JSON.stringify(coreResearchers) !==
      JSON.stringify(originalCoreResearcher);
    // Compara la lista de imágenes con la original
    const imagesChanged =
      JSON.stringify(imagePreviews) !== JSON.stringify(originalImagenes);

    // Retorna true si hay cambios en el proyecto o en los investigadores
    return (
      projectChanged ||
      researchersChanged ||
      imagesChanged ||
      coreResearchersChanged
    );
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-1 justify-center items-center w-full h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full relative min-h-screen">
      <h1 className="text-3xl text-white text-center py-5">Project Gallery</h1>
      <div className="flex w-full justify-center items-center px-10">
        <TablaProjects
          projects={projects}
          imagenes={imagenes}
          handleEditClick={handleEditClick}
          handleDeleteProyecto={handleDeleteProyecto}
        />
      </div>
      <ButtonAdd handle={handleAddClick} />

      {editingProject && (
        <ContainerForm
          title={isCreating ? "New Project" : "Edit Project"}
          closeContainer={() => {
            if (!hasChanges()) setEditingProject(null);
            else setShowCancel(true);
          }}
          handleSubmit={handleSubmit}
          isCreating={isCreating}
          handleDelete={() => {
            setCurrentProyect(editingProject.id);
            setShowDelete(true);
          }}
          hasChanges={hasChanges}
        >
          <div className="flex gap-4 w-full">
            <div className="w-[70%]">
              <InputBasic
                title="Title *"
                name="title"
                valor={editingProject.title}
                handle={handleInputChange}
                isRequired={true}
              />
            </div>
            <div className="w-[30%]">
              <InputBasic
                title="Code *"
                name="code_project"
                valor={editingProject.code_project}
                handle={handleInputChange}
                isRequired={true}
              />
            </div>
          </div>
          <InputBasic
            title="Subtitle"
            name="subtitle"
            valor={editingProject.subtitle}
            handle={handleInputChange}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InputTextArea
              title="Abstract"
              name="abstract"
              valor={editingProject.abstract}
              handle={handleInputChange}
            />
            <InputTextArea
              title="Description"
              name="description_"
              valor={editingProject.description_} // Asegúrate de que sea description_
              handle={handleInputChange}
            />
          </div>
          {/**  Seccion de personas */}
          <div className="flex flex-col lg:flex-row w-full gap-4">
            <div className="w-full lg:w-[40%]">
              <InputMultipleSelection
                title="Core Researcher *"
                name="Select Core Researcher"
                valor={coreResearchers}
                notShow={selectedResearcher}
                update={setSelectCoreResearcher}
                handle={handleInputChangeCoreResearcher} // Cambia esto
                elementos={investigadoresExistentes.map(
                  (investigador) => investigador
                )}
                isRequired={true}
              />
            </div>
            <div className="w-full lg:w-[60%]">
              <InputMultipleSelection
                title="Collaborators"
                name="Select collaborators"
                valor={selectedResearcher}
                notShow={coreResearchers}
                update={setSelectedResearcher}
                handle={handleInputChangeResearcher} // Cambia esto
                elementos={investigadoresExistentes.map(
                  (investigador) => investigador
                )}
              />
            </div>
          </div>
          {/** Seccion de fechas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <InputDate
              title="Start Date *"
              name="start_date"
              valor={editingProject.start_date}
              handle={handleInputChange}
              isRequired={true}
            />
            <InputDate
              title="End Date"
              name="end_date"
              valor={editingProject.end_date}
              handle={handleInputChange}
            />
            <InputSelection
              title="State *"
              name="state_"
              valor={editingProject.state_}
              handle={handleInputChange}
              elementos={["Finished", "In Progress", "Canceled"]}
              isRequired={true}
            />
          </div>

          <InputSelection
            title="Main Image"
            name="core_image"
            valor={editingProject.core_image}
            handle={handleInputChange}
            elementos={coreImagePreviews}
          />

          <InputMutipleImage
            handleImageUpload={handleFilesChange}
            handleImageDelete={handleImageDelete}
            imagePreviews={imagePreviews}
            error={error}
          />
        </ContainerForm>
      )}
      {showAlert && (
        <Alert
          title={alertMessage[0]}
          message={alertMessage[1]}
          isOpen={() => setShowAlert(false)}
        />
      )}
      {showDelete && (
        <AlertConfirm
          title="Delete"
          message="Are you sure you want to delete this project?"
          cancel={() => setShowDelete(false)}
          confirm={() => {
            handleDeleteProyecto(currentProyect);
            setShowDelete(false);
          }}
          action="Delete"
        />
      )}
      {showCancel && (
        <AlertConfirm
          title="Unsaved changes"
          message="Are you sure you want to close without saving changes?"
          cancel={() => setShowCancel(false)}
          confirm={() => {
            setEditingProject(null);
            setImagesToDelete([]);
            setShowCancel(false);
          }}
          action="Yes"
        />
      )}
    </div>
  );
};

export default Proyectos;
