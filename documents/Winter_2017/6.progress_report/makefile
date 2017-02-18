LATEX   = latex -shell-escape
BIBTEX  = bibtex
DVIPS   = dvips
DVIPDF  = dvipdft
XDVI    = xdvi -gamma 4
GH      = gv

all: pdf

pdf:
	latex progress_report.tex
	latex progress_report.tex
	dvips -R -Poutline -t letter progress_report.dvi -o progress_report.ps
	ps2pdf progress_report.ps

clean:
	rm -f *.o *.pdf *.ps *.dvi *.out *.log *.aux *.bbl *.blg *.pyg

.PHONY: all show clean ps pdf showps
