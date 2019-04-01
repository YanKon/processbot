# pylint: disable=no-member # (ignoriert die warnungen von sqlAlchemy db.columns)
from app import db
from datetime import datetime

class Process(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    processName= db.Column(db.String(64), index=True, unique=True)
    importDate= db.Column(db.DateTime, default=datetime.utcnow)
    noExecutes= db.Column(db.Integer)

class ProcessDoc(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    description= db.Column(db.Text)
    processId= db.Column(db.String(40), db.ForeignKey('process.id'))

class Node(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    name= db.Column(db.String(100))
    type= db.Column(db.String(100))
    highlighted= db.Column(db.Boolean, default=False)
    processId= db.Column(db.String(40), db.ForeignKey('process.id'))

class Edge(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    highlighted= db.Column(db.Boolean, default=False)
    processId= db.Column(db.String(40), db.ForeignKey('process.id'))
    sourceId= db.Column(db.String(40), db.ForeignKey('node.id'))
    targetId= db.Column(db.String(40), db.ForeignKey('node.id'))

class GeneralInstruction(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    text= db.Column(db.Text)
    nodeId= db.Column(db.String(40), db.ForeignKey('node.id'))

class DetailInstruction(db.Model):
    id= db.Column(db.String(40), primary_key=True)
    text= db.Column(db.Text)
    nodeId= db.Column(db.String(40), db.ForeignKey('node.id'))