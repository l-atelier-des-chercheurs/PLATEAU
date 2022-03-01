const path = require("path"),
  fs = require("fs-extra"),
  archiver = require("archiver");

const auth = require("./core/auth"),
  dev = require("./core/dev-log"),
  cache = require("./core/cache"),
  api = require("./core/api"),
  file = require("./core/file"),
  exporter = require("./core/exporter"),
  importer = require("./core/importer"),
  sockets = require("./core/sockets"),
  remote_api = require("./core/remote_api");

module.exports = function (app) {
  /**
   * routing event
   */
  app.get("/", showIndex);
  app.get("/:slugProjectName", loadFolder);
  app.get("/:type/:slugFolderName", printFolder);
  app.get("/:type/:slugFolderName/pdf", createAndDownloadPDF);
  app.get("/:type/:slugFolderName/full_planning", getFullPlanning);
  app.get("/_archives/:type/:slugFolderName", downloadArchive);
  app.post("/_file-upload/:type/:slugFolderName", postFile);

  remote_api.init(app);

  // app.ws('/_collaborative-editing', collaborativeEditing);

  function collaborativeEditing(ws, req) {
    console.log("WebSocket sharedb event");

    ws.on("message", (msg) => {
      console.log("WebSocket was closed");
      ws.send(msg);
    });

    ws.on("close", () => {
      console.log("WebSocket was closed");
    });
  }

  /**
   * routing functions
   */
  function generatePageData(req) {
    return new Promise(function (resolve, reject) {
      let fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
      dev.log(`••• the following page has been requested: ${fullUrl} •••`);

      let pageData = {};

      pageData.pageTitle = global.appInfos.productName;
      // full path on the storage space, as displayed in the footer
      pageData.folderPath = api.getFolderPath();
      pageData.slugFolderName = "";
      pageData.url = req.path;
      pageData.protocol = req.protocol;
      pageData.structure = global.settings.structure;
      pageData.isDebug = dev.isDebug();

      pageData.store = Object.keys(global.settings.structure).reduce(
        (acc, k) => {
          acc[k] = {};
          return acc;
        },
        {}
      );

      pageData.mode = "live";

      resolve(pageData);
    });
  }

  // GET
  function showIndex(req, res) {
    generatePageData(req).then(
      (pageData) => {
        // dev.logpackets(
        //   `Rendering index with data `,
        //   JSON.stringify(pageData, null, 4)
        // );
        res.render("index", pageData);
      },
      (err) => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function loadFolder(req, res) {
    let slugFolderName = req.param("slugProjectName");
    const type = "projects";

    generatePageData(req).then(
      (pageData) => {
        // let’s make sure that folder exists first and return some meta
        file
          .getFolder({ type, slugFolderName })
          .then(
            (foldersData) => {
              pageData.slugFolderName = slugFolderName;
              pageData.store[slugFolderName] = foldersData;
              return res.render("index", pageData);
            },
            (err, p) => {
              dev.error(`Failed to get folder: ${err}`);
              pageData.noticeOfError = "failed_to_find_folder";
              res.render("index", pageData);
            }
          )
          .catch((err) => {
            dev.error("No folder found");
          });
      },
      (err) => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function printFolder(req, res) {
    const type = req.param("type");
    const slugFolderName = req.param("slugFolderName");

    generatePageData(req).then((pageData) => {
      dev.logverbose(`Generated slugFolderName pageData`);
      dev.logverbose(
        `Now getting data for type = ${type} and slugFolderName = ${slugFolderName}`
      );

      exporter
        .loadFolder({ type, slugFolderName, pageData })
        .then((pageData) => {
          pageData.slugFolderName = slugFolderName;
          pageData.mode = "print_folder";
          res.render("index", pageData);
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    });
  }

  function createAndDownloadPDF(req, res) {
    const type = req.param("type");
    const slugFolderName = req.param("slugFolderName");

    // générer le PDF
    exporter
      .makePDFForPubli({ type, slugFolderName })
      .then(({ pdfName, pdfPath }) => {
        res.download(pdfPath, pdfName, function (err) {
          if (err) {
          } else {
          }
        });
      });
  }

  function getFullPlanning(req, res) {
    dev.log(`ROUTER : getFullPlanning`);

    const type = req.param("type");
    const slugFolderName = req.param("slugFolderName");

    let pads = req.query.pads;
    if (!pads) return false;
    pads = pads.replace(/\*/g, ".").split(",");

    generatePageData(req).then((pageData) => {
      dev.logverbose(`Generated slugFolderName pageData`);
      dev.logverbose(
        `Now getting data for type = ${type} and slugFolderName = ${slugFolderName}`
      );

      exporter.loadFolder({ type, slugFolderName, pageData }).then((folder) => {
        pageData.slugFolderName = slugFolderName;

        const all_projects_medias =
          folder.publiAndMediaData[slugFolderName].medias;

        const folder_meta = folder.publiAndMediaData[slugFolderName];
        delete folder_meta.medias;
        folder_meta.medias = {};

        // in folder_meta.medias, delete all medias that are not in pads
        // Object.keys(folder_meta.medias).map((k) => {
        //   debugger;
        //   if (!pads.includes(k)) {
        //     delete folder_meta.medias[k];
        //   }
        // });

        pads.map((pad_metaFileName) => {
          folder_meta.medias[pad_metaFileName] =
            all_projects_medias[pad_metaFileName];
        });

        pageData.store.projects[slugFolderName] = folder_meta;
        pageData.mode = "export_planning";
        res.render("index", pageData);
      });
    });
  }

  function downloadArchive(req, res) {
    let type = req.param("type");
    let slugFolderName = req.param("slugFolderName");

    // check if folder is protected
    file
      .getFolder({ type: type, slugFolderName })
      .then((foldersData) => {
        const folder_meta = Object.values(foldersData)[0];
        if (!folder_meta.hasOwnProperty("password") || !folder_meta.password) {
          return;
        }
        // if it is, check that we have a socketid with the request and if so, if that id is allowed to access that folder
        if (!req.query.hasOwnProperty("pwd")) {
          throw "Missing password for protected folder";
        }
        const pwd = req.query.pwd;

        if (String(auth.hashCode(folder_meta.password)) !== String(pwd)) {
          throw "Wrong password for folder";
        }

        return;
      })
      .then(() => {
        dev.log(
          `Will create and stream archive for folder ${type}/${slugFolderName}`
        );

        // checks passed
        var archive = archiver("zip", {
          zlib: { level: 0 }, //
        });

        archive.on("error", function (err) {
          res.status(500).send({ error: err.message });
        });

        //on stream closed we can end the request
        archive.on("end", function () {
          dev.log("Archive wrote %d bytes", archive.pointer());
        });

        //set the archive name
        res.attachment(slugFolderName + ".zip");

        //this is the streaming magic
        archive.pipe(res);

        const baseFolderPath = global.settings.structure[type].path;
        const mainFolderPath = api.getFolderPath(baseFolderPath);
        const thisFolderPath = path.join(mainFolderPath, slugFolderName);

        archive.directory(thisFolderPath, false);

        archive.finalize();
      })
      .catch((err) => {
        dev.error(`Error! ${err}`);
        res.status(500).send({ error: err });
      });
  }

  async function postFile(req, res) {
    let type = req.params.type;
    let slugFolderName = req.params.slugFolderName;

    const isSocketAllowed = await isSocketIDAuthorized({
      socketid: req.query.socketid,
      type,
      slugFolderName,
    }).catch((err) => {
      sockets.notify({
        socketid: req.query.socketid,
        localized_string: `action_not_allowed`,
        not_localized_string: err.message,
        type: "error",
      });
    });
    if (!isSocketAllowed) return false;

    importer
      .handleForm({ req, type, slugFolderName })
      .then(({ msg }) => {
        sockets.notify({
          socketid: req.query.socketid,
          localized_string: `imported_files_successfully`,
          type: "success",
        });
        res.end(JSON.stringify(msg));
      })
      .catch(({ err }) => {
        sockets.notify({
          socketid: req.query.socketid,
          localized_string: `action_not_allowed`,
          not_localized_string: err.message,
          type: "error",
        });
        res.end();
      });
  }

  async function isSocketIDAuthorized({ socketid, type, slugFolderName }) {
    if (!socketid) throw "Missing socketid in URL";

    const connected_sockets = sockets.io().sockets.connected;

    if (!connected_sockets || !connected_sockets.hasOwnProperty(socketid)) {
      throw "Missing sockets server-side.";
    }

    const socket = connected_sockets[socketid];

    const foldersData = await file.getFolder({ type, slugFolderName });
    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: folder can’t be edited ${slugFolderName} ${err}`,
            type: "error",
          });
        }))
    )
      throw "User can’t edit folder";

    return true;
  }
};
