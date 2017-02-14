LATEX	= latex -shell-escape
BIBTEX	= bibtex
DVIPS	= dvips
DVIPDF  = dvipdft
XDVI	= xdvi -gamma 4
GH		= gv

all: pdf

pdf:
	latex problemstatement.tex
	#bibtex powersst_final
	#bibtex powersst_processes
	#bibtex powersst_io
	#bibtex powersst_interrupts
	#bibtex powersst_filesystems
	#latex powersst_final.tex
	latex problemstatement.tex 
	dvips -R -Poutline -t letter problemstatement.dvi -o problemstatement.ps
	ps2pdf problemstatement.ps

clean:
	rm -f *.o *.pdf *.ps *.dvi *.out *.log *.aux *.bbl *.blg *.pyg

.PHONY: all show clean ps pdf showps

