LATEX	= latex -shell-escape
BIBTEX	= bibtex
DVIPS	= dvips
DVIPDF  = dvipdft
XDVI	= xdvi -gamma 4
GH		= gv

all: pdf

pdf:
	latex requirements.tex
	#bibtex bibtexfile
	#latex latexdocument.tex
	latex requirements.tex 
	dvips -R -Poutline -t letter requirements.dvi -o requirements.ps
	ps2pdf requirements.ps

clean:
	rm -f *.o *.pdf *.ps *.dvi *.out *.log *.aux *.bbl *.blg *.pyg

.PHONY: all show clean ps pdf showps

