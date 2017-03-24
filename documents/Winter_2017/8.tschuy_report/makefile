LATEX   = latex -shell-escape
BIBTEX  = bibtex
DVIPS   = dvips
DVIPDF  = dvipdft
XDVI    = xdvi -gamma 4
GH      = gv

all: pdf

pdf:
	latex tschuy_report.tex
	dvips -R -Poutline -t letter tschuy_report.dvi -o tschuy_report.ps
	ps2pdf tschuy_report.ps

clean:
	rm -f *.o *.pdf *.ps *.dvi *.out *.log *.aux *.bbl *.blg *.pyg

.PHONY: all show clean ps pdf showps
