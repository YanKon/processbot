# pylint: disable=no-member # (ignoriert die warnungen von sqlAlchemy db.columns)
from app import db
from datetime import datetime

class Process(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    processName= db.Column(db.String(64), index=True, unique=True)
    importDate= db.Column(db.Integer)

class ProcessDoc(db.Model):
    id= db.Column(db.Integer, primary_key=True)
    description= db.Column(db.Text)
    processId= db.Column(db.String(40), db.ForeignKey('process.id', ondelete = "CASCADE"))

class Node(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    name= db.Column(db.String(100))
    type= db.Column(db.String(100))
    currentStep= db.Column(db.Boolean, default=False)
    processId= db.Column(db.String(40), db.ForeignKey('process.id', ondelete = "CASCADE"))

class Edge(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    processId= db.Column(db.String(40), db.ForeignKey('process.id', ondelete = "CASCADE"))
    sourceId= db.Column(db.String(40), db.ForeignKey('node.id', ondelete = "CASCADE"))
    targetId= db.Column(db.String(40), db.ForeignKey('node.id', ondelete = "CASCADE"))

class GeneralInstruction(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    text= db.Column(db.Text)
    nodeId= db.Column(db.String(40), db.ForeignKey('node.id', ondelete = "CASCADE"))

class DetailInstruction(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    text= db.Column(db.Text)
    nodeId= db.Column(db.String(40), db.ForeignKey('node.id', ondelete = "CASCADE"))

class ButtonName(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    text= db.Column(db.Text)
    nodeId= db.Column(db.String(40), db.ForeignKey('node.id', ondelete = "CASCADE"))

class SplitQuestion(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    text= db.Column(db.Text)
    nodeId= db.Column(db.String(40), db.ForeignKey('node.id', ondelete = "CASCADE"))

class DetailDescription(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    text= db.Column(db.Text)
    nodeId= db.Column(db.String(40), db.ForeignKey('node.id', ondelete = "CASCADE"))