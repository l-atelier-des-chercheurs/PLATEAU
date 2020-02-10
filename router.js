const path = require("path"),
  fs = require("fs-extra"),
  archiver = require("archiver");

const sockets = require("./core/sockets"),
  dev = require("./core/dev-log"),
  cache = require("./core/cache"),
  api = require("./core/api"),
  file = require("./core/file"),
  exporter = require("./core/exporter"),
  importer = require("./core/importer"),
  remote_api = require("./core/remote_api");

module.exports = function(app) {
  /**
   * routing event
   */
  app.get("/", showIndex);
  app.get("/:slugProjectName", loadFolder);
  app.get("/:type/:slugFolderName", printFolder);
  app.get("/:type/:slugFolderName/pdf", createAndDownloadPDF);
  app.get("/_archives/:type/:slugFolderName", downloadArchive);
  app.post("/file-upload/:type/:slugFolderName", postFile2);

  remote_api.init(app);

  // app.ws('/_collaborative-editing', collaborativeEditing);

  function collaborativeEditing(ws, req) {
    console.log("WebSocket sharedb event");

    ws.on("message", msg => {
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
    return new Promise(function(resolve, reject) {
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
      pageData.authorsFolder = global.settings.structure.authors.path;
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
      pageData => {
        // dev.logpackets(
        //   `Rendering index with data `,
        //   JSON.stringify(pageData, null, 4)
        // );
        res.render("index", pageData);
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function loadFolder(req, res) {
    let slugFolderName = req.param("slugProjectName");
    const type = "projects";

    generatePageData(req).then(
      pageData => {
        // let’s make sure that folder exists first and return some meta
        file
          .getFolder({ type, slugFolderName })
          .then(
            foldersData => {
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
          .catch(err => {
            dev.error("No folder found");
          });
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function printFolder(req, res) {
    const type = req.param("type");
    const slugFolderName = req.param("slugFolderName");

    generatePageData(req).then(pageData => {
      dev.logverbose(`Generated slugFolderName pageData`);
      dev.logverbose(
        `Now getting data for type = ${type} and slugFolderName = ${slugFolderName}`
      );

      exporter.loadFolder({ type, slugFolderName, pageData }).then(pageData => {
        pageData.slugFolderName = slugFolderName;
        pageData.mode = "print_folder";
        res.render("index", pageData);
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
        res.download(pdfPath, pdfName, function(err) {
          if (err) {
          } else {
          }
        });
      });
  }

  function downloadArchive(req, res) {
    let type = req.param("type");
    let slugFolderName = req.param("slugFolderName");

    // check if folder is protected
    file
      .getFolder({ type: type, slugFolderName })
      .then(foldersData => {
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
          zlib: { level: 0 } //
        });

        archive.on("error", function(err) {
          res.status(500).send({ error: err.message });
        });

        //on stream closed we can end the request
        archive.on("end", function() {
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
      .catch(err => {
        dev.error(`Error! ${err}`);
        res.status(500).send({ error: err });
      });
  }

  function postFile2(req, res) {
    let type = req.param("type");
    let slugFolderName = req.param("slugFolderName");
    importer.handleForm({ req, res, type, slugFolderName });
  }
};
