import React from 'react'
import PropTypes from 'prop-types'
import Canvg from 'canvg'
import { IconButton, Tooltip, Snackbar } from '@material-ui/core'
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import UndoIcon from '@material-ui/icons/Undo'
import RedoIcon from '@material-ui/icons/Redo'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import DeleteIcon from '@material-ui/icons/Delete'
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan'
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined'
import BugReportOutlinedIcon from '@material-ui/icons/BugReportOutlined'
import RotateRightIcon from '@material-ui/icons/RotateRight'
import BorderClearIcon from '@material-ui/icons/BorderClear'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import ClearAllIcon from '@material-ui/icons/ClearAll'
import CreateNewFolderOutlinedIcon from '@material-ui/icons/CreateNewFolderOutlined'
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined'
import { Link as RouterLink } from 'react-router-dom'

import { NetlistModal, HelpScreen, ImageExportDialog } from './ToolbarExtension'
import { ZoomIn, ZoomOut, ZoomAct, DeleteComp, PrintPreview, ErcCheck, Rotate, GenerateNetList, Undo, Redo, Save, ClearGrid } from './Helper/ToolbarTools'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSimulate, closeCompProperties, setSchXmlData, saveSchematic } from '../../redux/actions/index'

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginLeft: 'auto',
    marginRight: theme.spacing(0),
    padding: theme.spacing(1),
    [theme.breakpoints.up('lg')]: {
      display: 'none'
    }
  },
  tools: {
    padding: theme.spacing(1),
    margin: theme.spacing(0, 0.5),
    color: '#262626'
  },
  pipe: {
    fontSize: '1.45rem',
    color: '#d6c4c2',
    margin: theme.spacing(0, 1.5)
  }
}))

function SimpleSnackbar ({ open, close, message }) {
  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={open}
        autoHideDuration={6000}
        onClose={close}
        message={message}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={close}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  )
}

SimpleSnackbar.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  message: PropTypes.string
}

export default function SchematicToolbar ({ mobileClose, gridRef }) {
  const classes = useStyles()
  const netfile = useSelector(state => state.netlistReducer)
  const auth = useSelector(state => state.authReducer)
  const schSave = useSelector(state => state.saveSchematicReducer)

  const dispatch = useDispatch()

  // Netlist Modal Control
  const [open, setOpen] = React.useState(false)
  const [netlist, genNetlist] = React.useState('')

  const handleClickOpen = () => {
    var compNetlist = GenerateNetList()
    var netlist = netfile.title + '\n' +
      netfile.model + '\n' +
      compNetlist + '\n' +
      netfile.controlLine + '\n' +
      netfile.controlBlock + '\n'
    genNetlist(netlist)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  // Help dialog window
  const [helpOpen, setHelpOpen] = React.useState(false)

  const handleHelpOpen = () => {
    setHelpOpen(true)
  }

  const handleHelpClose = () => {
    setHelpOpen(false)
  }

  // Delete component
  const handleDeleteComp = () => {
    DeleteComp()
    dispatch(closeCompProperties())
  }

  // Notification Snackbar
  const [snacOpen, setSnacOpen] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const handleSnacClick = () => {
    setSnacOpen(true)
  }

  const handleSnacClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnacOpen(false)
  }

  async function exportImage (type) {
    const svg = document.querySelector('#divGrid > svg').cloneNode(true)
    console.log(gridRef.current)
    svg.removeAttribute('style')
    svg.setAttribute('width', gridRef.current.scrollWidth)
    svg.setAttribute('height', gridRef.current.scrollHeight)
    const canvas = document.createElement('canvas')
    canvas.width = gridRef.current.scrollWidth
    canvas.height = gridRef.current.scrollHeight
    canvas.style.width = canvas.width + 'px'
    canvas.style.height = canvas.height + 'px'
    var images = svg.getElementsByTagName('image')
    for (var image of images) {
      const data = await fetch(image.getAttribute('xlink:href')).then((v) => {
        return v.text()
      })
      image.removeAttribute('xlink:href')
      image.setAttribute(
        'href',
        'data:image/svg+xml;base64,' + window.btoa(data)
      )
    }
    var ctx = canvas.getContext('2d')
    ctx.mozImageSmoothingEnabled = true
    ctx.webkitImageSmoothingEnabled = true
    ctx.msImageSmoothingEnabled = true
    ctx.imageSmoothingEnabled = true
    const pixelRatio = window.devicePixelRatio || 1
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    return new Promise(resolve => {
      if (type === 'SVG') {
        var svgdata = new XMLSerializer().serializeToString(svg)
        resolve('<?xml version="1.0" encoding="UTF-8"?>' + svgdata)
        return
      }
      var v = Canvg.fromString(ctx, svg.outerHTML)
      v.render().then(() => {
        var image = ''
        if (type === 'JPG') {
          const imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height)
          for (let i = 0; i < imgdata.data.length; i += 4) {
            if (imgdata.data[i + 3] === 0) {
              imgdata.data[i] = 255
              imgdata.data[i + 1] = 255
              imgdata.data[i + 2] = 255
              imgdata.data[i + 3] = 255
            }
          }
          ctx.putImageData(imgdata, 0, 0)
          image = canvas.toDataURL('image/jpeg', 1.0)
        } else {
          if (type === 'PNG') {
            image = canvas.toDataURL('image/png')
          }
        }
        resolve(image)
      })
    })
  }

  function downloadImage (data, type) {
    var evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    })
    var a = document.createElement('a')
    const ext = (type === 'PNG') ? '.png' : '.jpg'
    a.setAttribute('download', schSave.title + ext)
    a.setAttribute('href', data)
    a.setAttribute('target', '_blank')
    a.dispatchEvent(evt)
  }

  function downloadText (data, options) {
    const blob = new Blob(data, options)
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    })
    const a = document.createElement('a')
    a.setAttribute('download', schSave.title + '.svg')
    a.href = URL.createObjectURL(blob)
    a.target = '_blank'
    a.setAttribute('target', '_blank')
    a.dispatchEvent(evt)
  }

  const [imgopen, setImgOpen] = React.useState(false)

  const handleImgClickOpen = () => {
    setImgOpen(true)
  }

  const handleImgClose = (value) => {
    setImgOpen(false)
    if (value === 'SVG') {
      exportImage('SVG')
        .then(v => {
          downloadText([v], {
            type: 'data:image/svg+xml;charset=utf-8;'
          })
        })
    } else if (value === 'PNG') {
      exportImage('PNG')
        .then(v => {
          downloadImage(v, 'PNG')
        })
    } else if (value === 'JPG') {
      exportImage('JPG')
        .then(v => {
          downloadImage(v, 'JPG')
        })
    }
  }

  // Save Schematic
  const handelSchSave = () => {
    if (auth.isAuthenticated !== true) {
      setMessage('You are not Logged In')
      handleSnacClick()
    } else {
      var xml = Save()
      dispatch(setSchXmlData(xml))
      var title = schSave.title
      var description = schSave.description
      exportImage('PNG')
        .then(res => {
          dispatch(saveSchematic(title, description, xml, res))
        })
      setMessage('Saved Successfully')
      handleSnacClick()
    }
  }

  // Open Schematic
  const handelSchOpen = () => {
    const fileSelector = document.createElement('input')
    fileSelector.setAttribute('type', 'file')
    fileSelector.setAttribute('multiple', 'multiple')
    fileSelector.click()
  }

  return (
    <>
      {/* <MenuButton title={'File'} iconType={FolderIcon} items={['New', 'Open', 'Save', 'Print', 'Export']} /> */}
      <Tooltip title="New">
        <IconButton color="inherit" className={classes.tools} size="small" target="_blank" component={RouterLink} to="/editor" >
          <CreateNewFolderOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Open">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={handelSchOpen} >
          <OpenInBrowserIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Save">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={handelSchSave} >
          <SaveOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <SimpleSnackbar open={snacOpen} close={handleSnacClose} message={message} />
      <span className={classes.pipe}>|</span>

      <Tooltip title="Image Export">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={handleImgClickOpen}>
          <ImageOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <ImageExportDialog open={imgopen} onClose={handleImgClose} />
      <Tooltip title="Print Preview">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={PrintPreview}>
          <PrintOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <span className={classes.pipe}>|</span>

      <Tooltip title="Simulate">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={() => { dispatch(toggleSimulate()) }}>
          <PlayCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Generate Netlist">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={handleClickOpen} >
          <BorderClearIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <NetlistModal open={open} close={handleClose} netlist={netlist} />
      <Tooltip title="ERC Check">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={ErcCheck}>
          <BugReportOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <span className={classes.pipe}>|</span>

      <Tooltip title="Undo">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={Undo}>
          <UndoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Redo">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={Redo}>
          <RedoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Rotate">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={Rotate}>
          <RotateRightIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <span className={classes.pipe}>|</span>

      <Tooltip title="Zoom In">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomIn}>
          <ZoomInIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom Out">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomOut}>
          <ZoomOutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Default Size">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={ZoomAct}>
          <SettingsOverscanIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <span className={classes.pipe}>|</span>

      <Tooltip title="Delete">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={handleDeleteComp}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Clear All">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={ClearGrid}>
          <ClearAllIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Help">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={handleHelpOpen}>
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <HelpScreen open={helpOpen} close={handleHelpClose} />

      <IconButton
        color='inherit'
        aria-label='open drawer'
        edge='end'
        size="small"
        onClick={mobileClose}
        className={classes.menuButton}
      >
        <AddBoxOutlinedIcon fontSize="small" />
      </IconButton>
    </>
  )
}

SchematicToolbar.propTypes = {
  mobileClose: PropTypes.func,
  gridRef: PropTypes.object.isRequired
}
